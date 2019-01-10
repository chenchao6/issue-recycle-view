const app = getApp();
const config = app.globalData;
const baseData = {
    // 运营位相关数据
    brandIndexOffset: 0,
    wap_consumer: 'A1',
    userId: '',
    people_tag: '',
    // 通过该标识初始化运营位isActive，因为页面初始化时会传入上面这些初始值
    couponJumper: null,
    isInitOperation: true,

    // 已初始化首页、需要重定向的时候不会初始化、返回onShow要初始化
    isInitPage: false,
    options: null,
    isIphoneX: config.isIphoneX,
    domainWhitelist: null, // 域名白名单
    adPopupZoneId: '', // 弹窗广告位
    hideAdPopup: true,
    hideOperationContent: false,
    oldUid: '',
    isShowGender: false,
    searchWord: null, // //搜索入口词数据 {"id":"397","type":"2","show_word":"红运年货节","real_word":"https://mst.vip.com/uploadfiles/exclusive_subject/te/v1/ASuzkbGzZznI0d35mhBGUw.php?wapid=mst_3552682&_src=mst&page_msg=VIP_NH-all-onsale&extra_banner=&mst_cdi=1&mst_page_type=guide&extra_type=1"}
    dftSearchTips: '搜索',
    allChannelList: [], // 全频道列表数据
    actChannel: {}, // 活动频道
    brandList: {}, // 档期列表数据(下标为频道code)
    brandListChannelId: {}, // 频道id，从layout获取，用于请求档期的
    // operation: {}, // 运营位数据(下标为频道Id)
    // operationCountdown: {}, // 运营位数据(下标为倒计时Id)
    brandPage: {}, // 档期分页(下标为频道code)
    isLastPage: {}, // 档期分页是否滑到最尾(下标为频道code)
    childViewId: {},
    selectedChannelIndex: 0, // 用户选中的频道
    selectedChannelIndexForSwiper: 0, // 用户选中的频道
    showAllChannels: false, // 是否显示所有频道
    win_height: 667,
    win_width: 375,
    win_dpr: 2,
    footer_text: config.footerTextLoading,
    footer_text_end: config.footerTextEnd,
    isSearchBarShow: true, // 当前搜索条是不是已经代开
    interceptorCallback: null, // 运营位加载后回调
    activeChannelIdMap: {}, // 活跃频道map、用于非活跃运营位回收
    getSuccessObj: null
};
export default baseData;
