// 倒计时组件
function countdown(opt) {
	let currentTime = new Date().getTime();
	let leaveTime = opt.leaveTime ? opt.leaveTime : opt.endTime - currentTime;
	let timeObj = {};
	if (leaveTime >= 0) {
		if (opt.format && opt.format.day) {
			timeObj.day = Math.floor(leaveTime / 1000 / 60 / 60 / 24);
		}
		if (opt.format && opt.format.hour) {
			// 如果format中没有设置day，则把它加到小时上去
			if (!opt.format.day) {
				timeObj.hour = PrefixInteger(Math.floor(leaveTime / 1000 / 60 / 60), 2);
			} else {
				timeObj.hour = PrefixInteger(Math.floor(leaveTime / 1000 / 60 / 60 % 24), 2);
			}
		}
		if (opt.format && opt.format.min) {
			timeObj.min = PrefixInteger(Math.floor(leaveTime / 1000 / 60 % 60), 2);
		}
		if (opt.format && opt.format.sec) {
			timeObj.sec = PrefixInteger(Math.floor(leaveTime / 1000 % 60 ), 2);
		}
		if (opt.format && opt.format.millisec) {
			timeObj.millisec = Math.floor(leaveTime / 1000 % 10 );
		}
		return timeObj;
	}
	return timeObj;
};
// 修正小数点后的位数
function PrefixInteger(num, n) {
	if (num > 9) {
        return num;
    } else { // 小于10的前面补零
        return (Array(n).join(0) + num).slice(-n);
    }
}

module.exports = countdown;
