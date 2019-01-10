// 本地存储
let storage = {
    /**
     * 保存值到本地存储
     * @method set
     * @param {String} key     需要保存的键名
     * @param {Object|String|Array|Boolean} value  需要保存的值
     * @param {Number} expires 存储的过期时间
     */
    set: function(key, value, expires) {
        let v = {};
        if (expires) {
            let d = new Date().getTime();
            v.expire = d + expires * 1000;
        }
        v.value = value;
        wx.setStorage({
            key: key,
            data: v,
        });
    },
    /**
     * 同步保存值到本地存储
     * @method setSync
     * @param {String} key     需要保存的键名
     * @param {Object|String|Array|Boolean} value  需要保存的值
     * @param {Number} expires 存储的过期时间
     */
    setSync: function(key, value, expires) {
        let v = {};
        if (expires) {
            let d = new Date().getTime();
            v.expire = d + expires * 1000;
        }
        v.value = value;
        try {
            wx.setStorageSync(key, v);
        } catch (e) {
            console.log('setStorage fail:  ' + e);
        }
    },
    /**
     * 需要获取的本地存储
     * @method get
     * @param  {String} key 对应的key
     * @return {Object|String|Array|Boolean}  返回值
     */
    get: function(key) {
        let value;
        try {
            value = wx.getStorageSync(key);
        } catch (e) {
            console.log('getStorage fail:  ' + e);
        }
        if (value === '' || value === null || value === undefined) {
            return '';
        }
        let expire = value.expire;
        if (expire && /^\d{13}$/.test(expire)) {
            let d = new Date().getTime();
            if (expire <= d) {
                wx.removeStorageSync(key);
                return '';
            }
        }

        return value.value;
    },
    /**
     * 删除一个或多个本地存储
     * @method remove
     * @param  {Array||String} key 需要删除的key
     */
    remove: function(key) {
        let that = this;
        if (typeof (key) === 'object') {
            for (let i in key) {
                that._remove(key[i]);
            }

        } else {
            this._remove(key);
        }
    },
    /**
     * 删除一个本地存储
     * @method _remove
     * @param  {String} key 需要删除的key
     */
    _remove: function(key) {
        try {
            wx.removeStorageSync(key);
        } catch (e) {
            console.log('removeStorage fail:  ' + e);
        }
    },
};
module.exports = storage;
