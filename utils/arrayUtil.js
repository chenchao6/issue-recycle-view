let arrayUtil = {
	// 根据数组的值删除
	removeByKey: function(obj, key) {
		let index = obj.indexOf(key);
	    this.removeByIndex(obj, index);
	},
	// 根据数组的下标删除
	removeByIndex: function(obj, index) {
		if (index > -1) {
			obj.splice(index, 1);
		}
	},
};
module.exports = arrayUtil;
