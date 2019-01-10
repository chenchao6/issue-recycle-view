import LightArt from '../../../framework/lightart/platforms/wxapp/entry';
const storage = require('../../../utils/storage.js');
const throttle = require('../../../utils/lodash.throttle');
const onfire = require('../../../utils/onfire');
import baseData from '../baseData';
const {
    getTemplateAndData,
    getLightMoreDataParams,
    getInitLightArtConf
} = require('../../../model/lightart');
let isFirstLoad;
const lightartPage = {
    data: {
        ...baseData,
        isInitPage: true,
        lightartLoading: false,
        isLoadingMore: false,
        lightartIds: {} // 保存lightArtId
    },
    onLoad(options) {
        isFirstLoad = true;
        this.data.oldUid = storage.get('userId') || '';
        // 不涉及到模板更新的项目直接赋值
        this.data.options = options;
        this.lightartInstance = {};
        this.lightartMap = {};
        // 注册监听广播
        this.fireObj = onfire.on('la_loadmore_flag', () => {
            this.isLoadingMore = false;
        });
        let _channelList = `[{
            "name": "今日推荐",
            "tag": "#nbshouye",
            "channel_id": "49",
            "channel_code": "nbshouye",
            "menu_code": "20180831001",
            "style_type": 1,
            "style": "vertical"
        }, {
            "name": "美妆",
            "tag": "#top-beauty",
            "channel_id": "2",
            "channel_code": "beauty",
            "menu_code": "20170217:1",
            "style_type": 1,
            "style": "vertical"
        }, {
            "name": "母婴",
            "tag": "#app-child-top",
            "channel_id": "-1",
            "channel_code": "kids",
            "menu_code": "qinzi-yuansheng",
            "style_type": 1,
            "style": "vertical"
        }, {
            "name": "国际",
            "tag": "#app-global-top",
            "channel_id": "11",
            "channel_code": "oversea",
            "menu_code": "20161010001",
            "style_type": 1,
            "style": "vertical"
        }, {
            "name": "家电",
            "tag": "#top-jiadian",
            "channel_id": "47",
            "channel_code": "jiadian",
            "menu_code": "20180518001",
            "style_type": 1,
            "style": "vertical"
        }, {
            "name": "家居",
            "tag": "#top-jiaju",
            "channel_id": "48",
            "channel_code": "jiaju",
            "menu_code": "20180518002",
            "style_type": 1,
            "style": "vertical"
        }, {
            "name": "生活",
            "tag": "#top-life",
            "channel_id": "20",
            "channel_code": "life0526",
            "menu_code": "20170421002",
            "style_type": 1,
            "style": "vertical"
        }, {
            "name": "唯品·奢",
            "tag": "#top-lux",
            "channel_id": "16",
            "channel_code": "lux",
            "menu_code": "20180118001",
            "style_type": 1,
            "style": "vertical"
        }]`;
        this.setData({
            allChannelList: JSON.parse(_channelList)
        })
        this.updateOperationParams();
        this.checkSelectGender();
        this.initLightArtData(this.data.allChannelList[0]);
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    win_height: res.windowHeight,
                    win_width: res.windowWidth,
                    win_dpr: res.pixelRatio,
                    icon_tips: res.windowWidth / 375
                });
            }
        });
        // 初始化右侧组件
        let component = this.selectComponent('#JfloatButtonGroup');
        component && component['onInit'] && component.onInit();
    },
    onShow() {
        // 非首次载入会检查
        if (!isFirstLoad) {
            wx.setNavigationBarTitle({
                title: '唯品会'
            });
            isFirstLoad = false;
            let instance = this.getCurrentLightInstance();
            if (instance) {
                instance.$onShow();
            }
            // 已初始化页面才走这边的逻辑
            this.updateLightArtData();
            this.updateOperationParams();
        }
        // 倒计时组件
        const countdownComponent =
            this.selectComponent && this.selectComponent('#countdownComponent');
        countdownComponent && countdownComponent.update();
    },
    onHide() {
        Object.keys(this.lightartInstance).map(key => {
            const instance = this.lightartInstance[key];
            instance.$onHide();
            return instance;
        });
        isFirstLoad = false;
    },
    onUnload() {
        this.lightartInstance = null;
        this.fireObj = null;
    },

    /**
     * 获取当前Light对象句柄
     */
    getCurrentLightInstance: function() {
        const item = this.data.allChannelList[this.data.selectedChannelIndex];
        return this.lightartInstance[item.channel_code];
    },
    /**
     * lightArt数据重新加载
     */
    updateLightArtData() {
        const wap_consumer = storage.get('wap_consumer') || 'A1';
        const userId = storage.get('userId');
        if (
            wap_consumer !== this.data.wap_consumer ||
            userId !== this.data.userId
        ) {
            this.setData({
                lightartIds: {},
                activeChannelIdMap: {}
            });
            this.data.channelCodeArr = [];
            this.initLightArtData(
                this.data.allChannelList[this.data.selectedChannelIndex]
            );
        }
    },
    /**
     * 初始化lightArt对象
     * @param {*} item
     */
    initLightArtData: function(item) {
        let self = this;
        const max = 3; // 最多保存频道数据个数
        const channelCode = item.channel_code;
        if (!this.data.channelCodeArr) {
            this.data.channelCodeArr = [];
        }
        // 如果已经存在重复的code
        if (this.data.channelCodeArr.indexOf(channelCode) != -1) {
            return;
        }
        this.data.channelCodeArr.push(channelCode);
        if (this.data.channelCodeArr.length > max) {
            // 清除最先的数据
            const nearClearCode = this.data.channelCodeArr.shift();
            delete this.data.activeChannelIdMap[nearClearCode];
            delete this.lightartInstance[nearClearCode];
        }
        wx.showLoading({ title: '加载中' });
        const menu_code = item.menu_code;
        const channel_name = item.name;
        getTemplateAndData({ menu_code, channel_name })
            .then(function({ templates, datas }) {
                const lightart = new LightArt({
                    ...getInitLightArtConf(),
                    onRender: {
                        success: function() {
                            wx.hideLoading();
                            // 为避免首屏数据过少，无法触发滚动加载，主动加载档期流数据
                            self.loadNext();
                        }
                    },
                    defaultConf: {
                        ...getLightMoreDataParams(),
                        menu_code,
                        channel_name
                    },
                    $lightart: {
                        head: {
                            templates,
                            datas
                        }
                    }
                });
                self.lightartInstance[channelCode] = lightart;
                self.data.lightartIds[channelCode] = lightart.id;
                self.data.activeChannelIdMap[channelCode] = true;
                self.setData({
                    lightartIds: self.data.lightartIds,
                    activeChannelIdMap: self.data.activeChannelIdMap
                });
            })
            .catch(() => {
                wx.hideLoading();
                this.setData({
                    error_show: true,
                    error_code: ''
                });
            });
    },
    handleScrollLoad: throttle(function() {
        if (this.isLoadingMore) {
            console.log('重复加载');
            return;
        }
        this.isLoadingMore = true;
        this.loadNext();
    }, 1500),
    loadNext: function() {
        const instance = this.getCurrentLightInstance();
        instance.$emitAction('!load_more');
    },
    /**
     * 监听scrollView的滚动事件
     */
    handleScroll: throttle(function(e) {
        let scrollTop = e.detail.scrollTop;
        // console.log(scrollTop);
        if (scrollTop > this.data.win_height * 2) {
            // 展示 回到顶部 按钮
            this.controllToTopIcon('show');
        } else {
            // 隐藏 回到顶部 按钮
            this.controllToTopIcon('hide');
        }
        this.previousScrollTop = scrollTop;
    }, 500),

    handleSwiperChange: function(e) {
        this.isLoadingMore = false;
        let index = e.detail.current;
        let item = this.data.allChannelList[index];
        let channelId = item.channel_id || '';
        let channelName = item.name;
        this.setData({
            selectedChannelIndex: index,
            channelScrollX: this.caculateScroll(index)
        });
        this.initLightArtData(item);
        // 根据e.detail.source来区分引起swiper变化的原因
        const { source } = e.detail;
        this.trackForChannelChanged(source === 'touch' ? 'slide' : 'click', {
            channelCode: item.channel_code,
            channelId,
            channelName
        });
        storage.set('channel', {
            channel_id: item.channel_id,
            channel_code: item.channel_code,
            menu_code: item.menu_code
        });
        this.controllToTopIcon('hide');
    }
};

export default lightartPage;
