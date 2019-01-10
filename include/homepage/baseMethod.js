const storage = require('../../utils/storage.js');
const baseMethod = {
    _state: '',
    /**
     * 点击切换频道
     */
    handleChannelClick: function(e) {
        const type = parseInt(e.currentTarget.dataset.type, 10); // 0：点击滑动频道，1：点击全部频道
        let index = e.currentTarget.dataset.channelIndex;
        let actChannel = e.currentTarget.dataset.actChannel;
        if (actChannel === '1') {
            router.routeTo('pages/special/special', {
                url: encodeURIComponent(decodeURIComponent(this.data.actChannel.type_value))
            });
        } else {
            if (index !== this.data.selectedChannelIndex) {
                this.setData({
                    selectedChannelIndex: index,
                    selectedChannelIndexForSwiper: index,
                    channelScrollX: this.caculateScroll(index)
                });
                // 切换频道会触发SwiperChange方法，所以这里不需要再加载数据了
            }
            if (type === 1) {
                this.handleHideAllChannels();
            }
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '品牌特卖'
        };
    },
    onTabItemTap() {
        Tracker.action('tap', 'tabbar_click_index');
    },
    /**
     * 搜索推荐页和埋点发送
     */
    gotoSearchSuggest: function() {
        let _this = this;
        storage.set('saleSource', 'search');
        if (_this.data.searchWord) {
            router.routeTo(`/pages/searchList/searchList?suggest_word=${encodeURIComponent(JSON.stringify(_this.data.searchWord))}`);
        } else {
            router.routeTo(`/pages/searchList/searchList?randomWord=${DEFAULT_SHOW_WORD}`);
        }
    },
    /**
     * 分类跳转和埋点发送
     */
    gotoCategory: function() {
        storage.set('saleSource', 'classify');
        router.routeTo('/pages/classifyProduct/classifyProduct');
    },
    operationSuccess(e) {
        // console.log('operationSuccess', e.detail);
        // if (!this.data.showLoading) {
        //     vipLoading.hideLoading();
        // }
        if (e.detail.layout) {
            this.setData({
                brandIndexOffset: e.detail.layout.length
            });
            // 延迟获取曝光
            Exposure.getExposeLater();
        }
        if (this.data.interceptorCallback) {
            this.data.interceptorCallback(e.detail);
            this.data.interceptorCallback = null;
        }
    },
    /**
     * 切换频道时发送行为埋点和页面埋点
     * @param {String} type 区别操作类型change-滑动 click-点击
     * @param {Object} data 埋点需要的数据
     * @param {String} data.channelCode
     * @param {String|Number} data.channelId
     */
    trackForChannelChanged(type, data) {
        
    },

    operationFail(e) {
        console.log('operationFail', e.detail);
        const msg = e.detail;
        if (msg.error_code) {
            this.setData({
                error_show: true,
                error_code: msg.error_code
            });
        }
    },

    operationAdvSuccess(e) {
        const { layout } = e.detail;
        const bannerId =
            layout &&
            layout[0] &&
            layout[0].item &&
            layout[0].item[0] &&
            layout[0].item[0].bannerid;
        // console.log('operationAdvSuccess', layout, bannerId)
        if (bannerId) {
            this.setData({
                hideAdPopup: false
            });
            Exposure.getExpose(true);
        } else {
            this.operationCloseAdv();
        }
    },

    operationCloseAdv() {
        this.setData({
            hideAdPopup: true,
            adPopupZoneId: ''
        });
    },
    operationCouponPop(e) {
        const { data } = e.detail;

        if (data) {
            this.setData({
                couponJumper: data
            });
        }
    },
    /**
     * onload打开指定频道
     * @param {*} tag
     */
    changeChannelByTagOrCode(tagOrCode) {
        let channel;
        let index;
        const channelList = this.data.allChannelList;
        for (let i = 0; i < channelList.length; i++) {
            if (channelList[i].tag === tagOrCode || channelList[i].channel_code === tagOrCode) {
                channel = channelList[i];
                index = i;
            }
        }
        if (!channel) {
            console.log('match no channel by tag:' + tagOrCode);
            return;
        }
        if (index !== this.data.selectedChannelIndex) {
            this.setData({
                selectedChannelIndex: index,
                selectedChannelIndexForSwiper: index,
                channelScrollX: this.caculateScroll(index)
            });
            // 切换频道会触发SwiperChange方法，所以这里不需要再加载数据了
        }
        this.controllToTopIcon('hide');
        return channel;
    },
    /**
     * 显示所有频道
     */
    handleShowAllChannels: function() {
        let channelListAnim = wx.createAnimation({
            duration: 200,
            timingFunction: 'ease',
        });
        channelListAnim.opacity(1).translateY(0).step();
        // this.setData({ showAllChannels: true });
    },
    /**
     * 收起所有频道
     */
    handleHideAllChannels: function() {
        let channelListAnim = wx.createAnimation({
            duration: 200,
            timingFunction: 'ease',
        });
        channelListAnim.opacity(0).translateY('-100%').step();
        // this.setData({ channelListAnim: channelListAnim.export() });
    },
    updateOperationParams() {
        console.log('updateOperationParams');
        if (
            storage.get('saturn') &&
            storage.get('userId') !== this.data.oldUid
        ) {
            const pages = getCurrentPages();
            const page = pages[pages.length - 1];
            if (page) {
                delete page.options.$route; // 避免relaunch后又跳转到$route页
                router.reLaunch(page.route || page.__route__, page.options);
                return;
            }
        }
        // 微信卡券 start
        // 首页特殊处理 等待首页第一次检验完成
        if (this.data.options.card_id) {
            wxCard.$init();
        }
        // 微信卡券 end

        // 微信卡券关联pms券
        this.selectComponent && this.selectComponent('#wxCardCoupon') && this.selectComponent('#wxCardCoupon').getWxCardCouponDoc();

        this.setData({
            isInitOperation: true,
        });
    },

    /**
     * 计算频道导航条滚动的长度
     * @param {Integer} index 当前频道的下标
     */
    caculateScroll: function(index) {
        const arr = this.data.allChannelList.slice(0, index);
        let length = -80;
        if (this.data.actChannel.type_value) {
            length = 0;
        }
        arr.forEach(item => {
            length += item.name.length * 14 + 20;
        });
        return (length * this.data.win_width) / 375;
    },
    /**
     * 是否显示 回到顶部 的按钮
     */
    controllToTopIcon(type = 'hide') {
        let floatButtonGroup =
            (this.selectComponent &&
                this.selectComponent('#JfloatButtonGroup')) ||
            null;
        if (!floatButtonGroup) {
            return;
        }
        floatButtonGroup.dealTopBtn({ isHide: type === 'show' ? false : true });
    },
    /**
     * 返回顶部
     */
    gotoTop: function() {
        let index = this.data.selectedChannelIndex;
        let item = this.data.allChannelList[index];
        let channel_code = item.channel_code;
        this.setData({
            [`childViewId.${channel_code}`]: `scroll_top_${channel_code}`
        });
    },
    /**
     * 刷新页面
     */
    reloadList: function() {
        router.reLaunch(this.route || this.__route__, this.options);
    },
    /**
     * 判断是否需要弹出选择男女的弹窗
     */
    checkSelectGender() {
        if (!storage.get('saturn') && !storage.get('selectGender')) {
            this.genderPopup({ isShowGender: true });
        }
    },
    genderPopup(e) {
        let isShowGender = e.detail ? e.detail.isShowGender : e.isShowGender;
        this.setData({ isShowGender });
    },
    handleSubmitInfo(e) {
        // formIdModule.set(e.detail.formId);
    },
    handleEmptyEvent() {
        // 用来捕捉空事件
        return;
    },
    getCardCouponSuccess(e) {
        this.setData({
            getSuccessObj: e.detail
        });
    }
};

export default baseMethod;
