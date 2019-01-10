import componentBehavior from '../component-behavior';
import LightArt from '../../entry';
// 提交wx.createRecycleContext能力
const createRecycleContext = require('../../components/recycle-view/index.js');
const storage = require('../../../../../../utils/storage.js');
const throttle = require('../../../../../../utils/lodash.throttle');
const onfire = require('../../../../../../utils/onfire');
const sysInfo = storage.get('systemInfo') || {};
const WHeight = sysInfo.windowHeight;
Component({
    behaviors: [componentBehavior],
    properties: {
        lightartId: Number
    },
    data: {
        node: null,
        count:0,
        scrollHeight: 500,
    },
    attached() {
        let self = this;
        this.isLoadingMore =false;
        // 注册监听广播
        this.fireObj = onfire.on('la_loadmore_flag', () => {
            this.isLoadingMore = false;
        });
        const lightart = LightArt.get(this.data.lightartId);
        if (!lightart) {
            console.error(
                `the lightartId:${
                    this.data.lightartId
                } get undefined in lightart-root`
            );
            return;
        }
        let startTime = new Date().getTime(); // 起始时间
        // 首屏的时候，如果是section_list,需要分批加载数据
        if (lightart.vdom.dt == 'section_list') {
            let box = JSON.parse(JSON.stringify(lightart.vdom));
            box.children=[];
            let sysInfo = storage.get('systemInfo') || {};
            console.log('sysInfo.windowWidth:'+sysInfo.windowWidth)
            this.setData({
                windowWidth:sysInfo.windowWidth,
            });
            // RecycleView

            let ctx = createRecycleContext({
                id: 'recycleId'+ self.data.lightartId,
                dataKey: 'recycleList'+ self.data.lightartId, // recycleList
                page: self,
                itemSize:{
                    props: ['component_id'],// component_id
                    cacheKey: 'cacheKey', // 预先缓存的key
                    queryClass: 'recycle-itemsize', // 动态查询的class
                    dataKey: 'recycleListItemSize'+ self.data.lightartId, // 预先渲染的数据的wx:for绑定的变量
                },
                // itemSize: self.itemSizeFunc,
            });
            let st =Date.now();
            this.ctx = ctx;
            this.calHeight().then(() => {
                // this.init();
            });
            let childData = [];
            const maxLen =
                lightart.vdom.children && lightart.vdom.children.length;
            let pageSize = 3;
            const pageNum = Math.ceil(maxLen / pageSize);
            const children = lightart.vdom.children;
            let pageIndex = 1;
            // 实现行号
            for (let i in lightart.vdom.children) {
                let section = lightart.vdom.children[i];
                let component_id_arr=[];
                for (let j in section.children) {
                    for(let k in section.children[j]){
                        let itm =section.children[j][k];
                        if (itm.component_id) {
                            component_id_arr.push(itm.component_id);
                        }
                        else if (itm.id) {
                            component_id_arr.push(itm.id);
                        }else {
                            console.log(itm);
                        }

                    }

                }
                section.component_id=component_id_arr.join(',');
            }



            this.setData({
                node: box
            },()=>{
                self.data.count = self.data.count + children.length;
                let appendList = [];
                for(let i in children){
                    appendList.push(children[i]);
                }
                ctx.append(appendList, function () {
                    // 新增加的数据渲染完毕之后, 触发的回调
                    console.log(children);
                    console.log('【render】'+children.length+' use time', Date.now() - st);
                    lightart.onRender.success &&
                    lightart.onRender.success();
                    // fntry();
                });
            // 递归setData
            // fntry();


            });

        } else {
            this.setData({
                node: lightart.vdom
            });
        }
        // 记录组件id->组件的引用关系、方便局部更新
        lightart._addCompoent(this.data.node.id, this);
        // console.log('lightart.vdom', lightart.vdom);
    },
    detached() {
        // 不继续保存组件引用
        const lightart = LightArt.get(this.data.lightartId);
        lightart._removeCompoent(this.data.node.id);
    },
    methods: {
        /**
         * 计算滚动区域的高度
         */
        calHeight: function () {
            try {
                const _this = this;
                return new Promise(resolve => {
                    const query = wx.createSelectorQuery();
                    query
                        .select('#header')
                        .boundingClientRect(function (rect) {
                            _this.setData({
                                scrollHeight: WHeight,
                                windowHeight: WHeight
                            });
                            resolve();
                        })
                        .exec();
                });
            } catch (e) { }
        },
        onTap(e) {
            console.log('onTap');
            // const lightart = LightArt.get(this.data.lightartId);
            // todo
            // const actions = this.data.node.actions;
            // const statistics = this.data.node.statistics;
            // if (actions && actions.click) {
            //     lightart.$action(actions.click);
            // }
            // if (statistics && (statistics.click || statistics.expose)) {
            //     lightart.$statistic(statistics);
            // }
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
            const lightart = LightArt.get(this.data.lightartId);
             lightart.$emitAction('!load_more');
        },
        onHide() {}
    }
});
