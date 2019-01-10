/**
 * native 组件
 * 按照旧首页的数据方式渲染
 * import引用的公共库是小程序自身的公共库
 * 注意点：
 *   1.lightArt依赖了旧方式的数据，目前的实现存在很大的冗余关系
 *   2.删除屏蔽运营位逻辑
 */
import countdown from '../../../../../../utils/countdown.js';
import { getSystemInfo } from '../../../../../../common/util';
import { laJumper } from '../../../../../../model/lightart';
import storage from '../../../../../../utils/storage.js';
import LightArt from '../../entry';

/**
 * // 初始化native布局信息
 * @param {*} node native节点信息
 */
const initNativeLayout = (node, component) => {
    const params = node && node.params;
    const typeName = node && node.name;
    if (params) {
        if (typeName == 'vs_mo_normal_view') {
            // 普通运营位
            node.section = 'operate';
            node.layout = params.data || {};
            node.layout.code = params.code || '';
        } else if (typeName == 'vs_mo_scroll_view') {
            // 滑动运营位
            node.section = 'slider';
            if (params.contents.length) {
                node.layout = params;
            }
        } else if (typeName == 'vs_mo_group_view') {
            if (params.groupContent) {
                if (params.groupContent.type == 'NORMAL') {
                    node.section = 'operate';
                    const opzData =
                        (params.groupContent && params.groupContent.opzData) ||
                        {};
                    node.layout = opzData.data || {};
                    node.layout.code = opzData.code || '';
                } else if (params.groupContent.type == 'SLIDER') {
                    node.section = 'slider';
                    const contents =
                        (params.groupContent &&
                            params.groupContent.opzData &&
                            params.groupContent.opzData.contents) ||
                        [];
                    if (contents.length) {
                        node.layout = params.groupContent.opzData;
                    }
                }
            }
        } else if (typeName == 'vs_ads_scroller') {
            // 广告位
            node.section = 'advertisement';
            node.layout = {};
            for (let j = 0; j < node.params.ad_list.length; j++) {
                if (j === 0) {
                    node.layout.swiperHeight = node.params.ad_list[0].height; // 235
                }
                let data = node.params.ad_list[j];
            }
            // 为广告位添加埋点数据
            // advertisementTrack.transformAdForTrack(node.params.ad_list, true);
            node.layout.item = node.params.ad_list;
        } else if (typeName == 'vs_brand') {
            node.section = 'brand';
            params.st_ctx_click.rank = component.data.lightartRow;
            params._trackDataSet = JSON.stringify(params.st_ctx_click);
            node.layout = params;
        } else if (typeName == 'vs_mst') {
            node.section = 'mst';
            params.st_ctx_click.rank = component.data.lightartRow;
            params._trackDataSet = JSON.stringify(params.st_ctx_click);
            node.layout = params;
        }
        delete node.params;
    }
};

Component({
    properties: {
        node: Object,
        lightartRow: Number,
        lightartId: Number
    },
    data: {
        windowWidth: 375,
        operationCountdown: {},
        countdownCount: 0,
        countdownHandler: null,
        countdownQuery: [],
        lastCountdownTime: 0,
        currentSwiperIndex: 0,
        channelId: 1
    },
    attached() {
        // 记录组件id->组件的引用关系、方便局部更新
        const lightart = LightArt.get(this.data.lightartId);
        // lightart监听原生倒计时事件
        lightart.$on('clear_native_countdown', ()  => {
            this.onHide();
        });
        lightart.$on('start_native_countdown', ()  => {
            this.onShow();
        });
        const node = this.data.node;
        if (!node || node.dt !== 'native') return;
        // 获取可视宽度
        this.data.windowWidth = getSystemInfo('windowWidth');
        // 初始化native布局信息
        initNativeLayout(node, this);
        let layout = node.layout;
        if (!layout) return;
        if (node.section == 'operate') {
            if (layout && layout.block && layout.block.length) {
                for (let j = 0; j < layout.block.length; j++) {
                    let block = layout.block[j];
                    if (block.cell === 'row') {
                        block.height = this.rpx(block.size);
                    } else {
                        block.width = this.rpx(block.size);
                    }
                    // console.log('block', block)
                    if (block.child) {
                        for (let k = 0; k < block.child.length; k++) {
                            let child = block.child[k];
                            if (child.cell === 'row') {
                                child.height = this.rpx(child.size);
                            } else {
                                child.width = this.rpx(child.size);
                            }
                            // 数据补充处理，担心数据接口结构缺失
                            child.timer = child.timer || {};
                            // child.timer.style = 'NORMAL'
                            // child.timer.row = 'TOP'
                            // child.timer.col = 'LEFT'
                            // child.timer.endTime = 1543572000
                            let cellSize =
                                child.cell === 'row' ? block.size : child.size;
                            // 宽度大于65才显示
                            if (child.timer.endTime && cellSize > 40) {
                                if (
                                    cellSize > 65 ||
                                    child.timer.style === 'NORMAL'
                                ) {
                                    if (
                                        [
                                            'NORMAL',
                                            'WHITE',
                                            'WHITE_HOUR',
                                            'BLACK',
                                            'BLACK_HOUR',
                                            'TRANSLUCENT'
                                        ].indexOf(child.timer.style) > -1
                                    ) {
                                        console.log('timer');
                                        child.countdownId = this.initCountdown(
                                            child.timer,
                                            1
                                        );
                                    }
                                }
                            }
                            if (child.data && child.data.jumper) {
                                // this.initCouponItem(child.data);
                            }
                        }
                        this.setData({
                            item: layout,
                            section: 'operate'
                        });
                    }
                }
            }
        } else if (node.section == 'advertisement') {
            // TODO: 数据装换
            this.setData({
                section: 'advertisement',
                item: layout
            });
        } else if (node.section == 'slider') {
            // TODO: 数据装换
            this.setData({
                section: 'slider',
                item: layout
            });
        } else if (node.section == 'brand') {
            this.setData({
                section: 'brand',
                item: layout
            });
        } else if (node.section == 'mst') {
            this.setData({
                section: 'mst',
                item: layout
            });
        }
    },
    detached() {},
    methods: {
        onShow() {
            this.data.isInactive = false;
            this.checkContinueCountdown();
        },
        onHide() {
            console.log('native hide');
            this.data.isInactive = true;
            clearTimeout(this.data.countdownHandler);
        },
        rpx(percent) {
            return `${(percent / 100) * this.data.windowWidth}px`;
        },
        setInfo(marsData, type) {
            storage.set('sourceFrom', marsData);
            storage.set('saleSource', type);
        },
        tapGo(e) {
            let dataset = e.currentTarget.dataset;
            let blockIndex = dataset.blockIndex;
            let childIndex = dataset.childIndex;
            let type = dataset.type;
            let data;
            let code = '';
            let channel = storage.get('channel');
            if (type === 'operate') {
                const item = this.data.item;
                const block = item.block[blockIndex];
                const child = block && block.child && block.child[childIndex];
                data = child && child.data;
                code = item.code;
                if (data) {
                    const marsData = {
                        adid:
                            (data.buryPoint && data.buryPoint.adsBannerId) ||
                            '',
                        opz_unid: data.opz_unid,
                        oi: code,
                        ot: '2',
                        chi: channel && channel.channel_id,
                        chc: channel && channel.channel_code,
                    };
                    this.setInfo(marsData, 'operation');
                }
            } else if (type == 'advertisement') {
                const item = this.data.item.item;
                data = item[blockIndex];
                if (data) {
                    const marsData = {
                        adid: data.bannerid,
                        opz_unid: data.ad_unid,
                        oi: data.zone_id,
                        ot: '1',
                        chi: channel && channel.channel_id,
                        chc: channel && channel.channel_code,
                        show_label: getShowLabel()
                    };
                    this.setInfo(marsData, 'banner');
                }
            } else if (type == 'slider') {
                const item = this.data.item;
                // 普通滑动运营位
                data = item.contents[blockIndex];
                if (data) {
                    code = item.sliderCode;
                    const marsData = {
                        adid: '', // 拿不到
                        opz_unid: data.opzUnid,
                        oi: code,
                        ot: '2',
                        chi: channel && channel.channel_id,
                        chc: channel && channel.channel_code,
                        show_label: getShowLabel()
                    };
                    this.setInfo(marsData, 'operation');
                }
            }
            if (data) {
                // operationJumper.jump(data);
            } else {
                console.warn('operation jump error:', code, dataset);
            }
        },
        /**
         * 档期或专题跳转
         */
        brandGo() {
            laJumper(this.data.item.href);
        },
        checkContinueCountdown() {
            if (this.data.countdownHandler) {
                this.continueCountdown(true);
            }
        },
        updateCountdownData(countdownId, countdownData) {
            const operationCountdown = this.data.operationCountdown;
            operationCountdown[countdownId] = countdownData;
            this.setData({
                operationCountdown
            });
        },
        // 初始化倒计时
        initCountdown(timer, channelId = 1) {
            // console.log('initCountdown', timer, channelId)
            ++this.data.countdownCount;
            const countdownId = `countdown_${channelId}_${
                this.data.countdownCount
            }`;
            let countTime = Math.floor(timer.endTime - Date.now() / 1000);
            const isNormal = timer.style === 'NORMAL';
            let maxTime = isNormal
                ? 59 + 59 * 60 + 99 * 60 * 60
                : 59 + 59 * 60 + 23 * 60 * 60 + 99 * 24 * 60 * 60;
            // 其它样式最大：99天23时59分59秒
            // 普通样式最大：99:59:59
            let lastTime = (countTime - maxTime) * 1000; // for out of 99天23时59分59秒

            if (countTime <= 0) {
                // 已过期
                if (timer.eventAfter !== 'VISIBLE') {
                    return false;
                }
                this.addCountDown(timer, countdownId, channelId);
                // 正常时间
            } else if (countTime > maxTime) {
                // 超过最大时间
                if (isNormal) {
                    this.updateCountdownData(countdownId, {
                        hour: '99',
                        min: '59',
                        sec: '59'
                    });
                } else {
                    this.updateCountdownData(countdownId, {
                        day1: 9,
                        day2: 9,
                        hour1: 2,
                        hour2: 3,
                        min1: 5,
                        min2: 9,
                        sec1: 5,
                        sec2: 9
                        // millisec: 9,
                    });
                }

                // 最大值，到钟后再倒计时
                this.data.lazyCountdownHandler = setTimeout(() => {
                    this.addCountDown(timer, countdownId, channelId);
                }, lastTime);
            } else {
                this.addCountDown(timer, countdownId, channelId);
                // 正常时间
            }
            return countdownId;
        },
        addCountDown(timer, countdownId, channelId) {
            this.data.countdownQuery.push({
                timer,
                countdownId,
                channelId
            });
            // 新增倒计时强制更新倒计时
            this.continueCountdown(true);
        },

        continueCountdown(force) {
            const now = Number(new Date());
            if (force || now - this.data.lastCountdownTime > 2000) {
                clearTimeout(this.data.countdownHandler);
                this.doCountDown();
            }
        },

        doCountDown() {
            // console.log('doCountDown', this.countdownQuery)
            let hasQuery = false;
            let syncData = this.data.operationCountdown;
            let now = Date.now();
            this.data.lastCountdownTime = now;
            for (let i = 0; i < this.data.countdownQuery.length; i++) {
                let { timer, countdownId } = this.data.countdownQuery[i];
                let endTime = timer.endTime * 1000;
                // 已到时间
                if (now - endTime >= 0) {
                    if (timer.eventAfter !== 'VISIBLE') {
                        syncData[countdownId] = false;
                    } else {
                        syncData[countdownId] = {
                            day: '00',
                            hour: '00',
                            min: '00',
                            sec: '00',
                            day1: 0,
                            day2: 0,
                            hour1: 0,
                            hour2: 0,
                            min1: 0,
                            min2: 0,
                            sec1: 0,
                            sec2: 0,
                            countdownIng: false
                        };
                    }
                    this.data.countdownQuery.splice(i, 1);
                    i--;
                } else {
                    const isNormal = timer.style === 'NORMAL';
                    const param = {
                        endTime,
                        format: {
                            day:
                                timer.style === 'WHITE' ||
                                timer.style === 'BLACK',
                            hour: true,
                            min: true,
                            sec: true,
                            millisec: !isNormal
                        }
                    };
                    const timeObj = countdown(param);
                    // console.log('doCountDown', timeObj)
                    if (!isNormal) {
                        const day =
                            param.format.day && String(timeObj.day).split('');
                        const hour = String(timeObj.hour).split('');
                        const min = String(timeObj.min).split('');
                        const sec = String(timeObj.sec).split('');
                        if (day) {
                            if (timeObj.day < 10) {
                                timeObj.day1 = 0;
                                timeObj.day2 = timeObj.day;
                            } else {
                                timeObj.day1 = day[0];
                                timeObj.day2 = day[1];
                            }
                        }
                        timeObj.hour1 = hour[0];
                        timeObj.hour2 = hour[1];
                        timeObj.min1 = min[0];
                        timeObj.min2 = min[1];
                        timeObj.sec1 = sec[0];
                        timeObj.sec2 = sec[1];
                    }
                    timeObj.countdownIng = 'u-countdowning';
                    syncData[countdownId] = timeObj;
                }
                hasQuery = true;
            }
            if (hasQuery) {
                this.setData({ operationCountdown: syncData });
                if (!this.data.isInactive) {
                    this.data.countdownHandler = setTimeout(() => {
                        this.doCountDown();
                    }, 1000);
                } else {
                    console.log('非活动状态取消倒计时');
                }
            }
        },
        operationChange(e) {
            this.setData({
                currentSwiperIndex: e.detail.current
            });
        }
    }
});
