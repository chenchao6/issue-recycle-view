const systemInfo = wx.getSystemInfoSync();

export const LIFECYCLE_HOOKS = [
    // '!before_load',
    // '!after_load',
    // '!before_appear',
    // '!after_appear',
    // '!foreground',
    // '!background',

    // 'onLoad',
    // 'onReady',
    // 'onShow',
    // 'onHide',
    // 'onUnload',
    // 'onPullDownRefresh',
    // 'onReachBottom',
    // 'onPageScroll',

    // 'beforeCreate',
    // 'created',
    // 'beforeMount',
    // 'mounted',
    // 'beforeUpdate',
    // 'updated',
    // 'beforeDestroy',
    // 'destroyed',
    // 'activated',
    // 'deactivated',
    // 'errorCaptured',
];

export const SYS_INFO = {
    platform: 'wxapp',
    screen_height: Math.ceil(systemInfo.windowHeight * systemInfo.pixelRatio),
    windowWidth: systemInfo.windowWidth,
    lightart_sdk_version: '1.1',
    lightart_version: '1.1'
};

export const SCREEN_INFO = {
    safe_areas: {
        t: 0,
        b: 0,
        l: 0,
        r: 0,
        state_bar_height: Math.ceil(systemInfo.statusBarHeight * systemInfo.pixelRatio)
    }
};
