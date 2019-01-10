import LightArt from '../../../core/index';
import { ajaxMixin } from './ajax';
import { renderMixin } from './render';
import { countdown } from '../../../core/instance/countdown';
const onfire = require('../../../../../utils/onfire');
ajaxMixin(LightArt);
renderMixin(LightArt);

LightArt.prototype.$dip = function(dip) {
    if (dip === '0dip') {
        return '0px'
    }
    if (dip) {
        dip = String(dip);
        dip = dip.replace(/dip/gi, 'rpx');
        if (/\d$/.test(dip)) {
            dip += dip > 0 ? 'rpx' : 'px'; // 注意一点 如果传入0rpx, 微信开发者工具生成0.5px, 所以为0的值需要传px
        }
    }
    return dip;
};

// 框架会主动调用_initRuntime、runtime相关的初始化可以放到里面
LightArt.prototype._initRuntime = function() {
    // console.log('_initRuntime')
    // 运行时components对象
    this._components = new Object(null);

    // load_more
    this.$onAction(
        '!load_more',
        ({ key, actionValue, event }) => {
            const vNode = this._vNodes[key];
            // 如果是没有渲染的元素不处理
            if (!vNode || !vNode._isMounted) {
                return false;
            }
        },
        ({ key, actionValue, event }) => {
            const vNode = this._vNodes[key];
            if (vNode._isLoading) return;
            let params = {};
            if (actionValue) {
                params.url = actionValue.url;
                params.data = {
                    load_more_token: actionValue.token,
                    ...this.defaultConf
                };
            }
            const component = this._components[vNode.id];
            // 不存在token
            if (!params.data.load_more_token) {
                return;
            }
            vNode._isLoading = true;
            if (component) {
                component.setData({
                    'node._isLoading': true
                });
            }
            this.$ajax(params)
                .then(res => {
                    vNode._isLoading = false;
                    if (res && res.data && res.data.code == 1) {
                        const result = res.data.data;
                        this.$update({
                            vNodeId: vNode.id,
                            template: this.$template,
                            data: result.data,
                            isAppend: true
                        });
                        if (component) {
                            component.setData({
                                'node._isLoading': false,
                            });
                        }
                        const load_more_token =
                            result &&
                            result.data &&
                            result.data.load_more_token;
                        if (load_more_token) {
                            this.$addAction('!load_more', key, {
                                url: actionValue.url,
                                token: load_more_token
                            });
                        } else {
                            this.$removeAction('!load_more', key);
                            if (component) {
                                component.setData({
                                    'node._isLoading': false,
                                    'node._isLast': true
                                });
                            }
                        }
                        // vNodeId, path, template, data, body, isAppend
                    }
                })
                .catch(e => {
                    // 通知加载失败事件
                    vNode._isLoading = false;
                    onfire.fire('la_loadmore_flag');
                    console.log('!load_more', e);
                });
        }
    );

    // refresh
    this.$onAction(
        '!refresh',
        ({ key, actionValue, event }) => {
            const vNode = this._vNodes[key];
            // 如果是没有渲染的元素不处理
            if (!vNode || !vNode._isMounted) {
                return false;
            }
        },
        ({ key, actionValue, event }) => {
            const vNode = this._vNodes[key];
            this.$ajax({
                showLoading: true,
                url: actionValue && actionValue.url
            })
                .then(res => {
                    if (res && res.data && res.data.$lightart) {
                        this.$update({
                            vNodeId: vNode.id,
                            body: res.data.$lightart.body,
                            isReplace: true
                        });
                        if (res.data.$lightart.body.refresh) {
                            this.$addAction(
                                '!refresh',
                                key,
                                res.data.$lightart.body.refresh
                            );
                        } else {
                            this.$removeAction('!refresh', key);
                        }
                        // vNodeId, path, template, data, body, isAppend
                    }
                    wx.stopPullDownRefresh();
                })
                .catch(e => {
                    console.log('!refresh error:', e);
                    wx.stopPullDownRefresh();
                });
        },
        () => wx.stopPullDownRefresh()
    );

    // countdown
    // 做一层缓存、避免未到开始时间已到结束时间时频繁的计算和setData
    const countdownCache = {};
    this.$onAction(
        '!countdown',
        ({ key, actionValue, event }) => {
            const vNode = this._vNodes[key];
            // 如果是没有渲染的元素不处理
            // console.log('vNode._isMounted', vNode._isMounted)
            if (!vNode || !vNode._isMounted) {
                return false;
            }
        },
        ({ key, actionValue, event }) => {
            // console.log(key, actionValue, event)
            const currentTime = Number(new Date());
            let leaveTime;
            // 活动倒计时标识、用于更新毫秒级动画
            let _isCountdownRunning = false;
            if (currentTime < actionValue.start_time) {
                leaveTime = actionValue.end_time - actionValue.start_time;
            } else if (currentTime > actionValue.end_time) {
                leaveTime = 0;
            } else {
                _isCountdownRunning = true;
                leaveTime = actionValue.end_time - currentTime;
            }
            // console.log('leaveTime', leaveTime, countdownCache, key, actionValue)
            // 未命中缓存才计算
            if (countdownCache[key] !== leaveTime) {
                const countdownObj = countdown({
                    currentTime,
                    leaveTime,
                    format: { day: true, hour: true, min: true, sec: true }
                });
                const template = this.$.head.templates[`countdown:${key}`];
                template._isCountdownRunning = _isCountdownRunning;
                // console.log(key, countdownObj.sec);
                this.$update({
                    vNodeId: key,
                    template: this.$.head.templates[`countdown:${key}`],
                    data: {
                        $countdown: {
                            day: countdownObj.day,
                            hour: countdownObj.hour,
                            minute: countdownObj.min,
                            second: countdownObj.sec,
                            // 使用一个比较宽的数字占位并不显示
                            tenth_second: 8 // countdownObj.millisec,
                        }
                    },
                    isUpdate: true
                });
                countdownCache[key] = leaveTime;
            }
        }
    );
};

export default LightArt;
