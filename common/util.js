const storage = require('../utils/storage');
/**
 * 同步获取系统信息
*/
const getSystemInfoSync = function() {
    let ret;
    try {
        ret = wx.getSystemInfoSync();
        storage.setSync('systemInfo', ret);
    } catch (e) {
        ret = null;
    }
    return ret;
};
/**
 * 获取系统信息systemInfo，用于先获取storage，获取不到再获取wx的
 * @param {String} key 获取的信息key，为空时获取整个系统信息对象
 */
exports.getSystemInfo = function(key = '') {
    let systemInfo = null;
    let value = null;
    if (key === 'windowHeight') {
        // 获取windowHeight有坑，因为有tabbar的页面和没有tabbar页面时，值不一样，需要实时获取
        systemInfo = getSystemInfoSync();
        value = systemInfo && systemInfo[key];
    } else {
        systemInfo = storage.get('systemInfo') || getSystemInfoSync();
        if (systemInfo && key && systemInfo[key]) {
            value = systemInfo[key];
        } else {
            value = systemInfo;
        }
    }
    return value;
};