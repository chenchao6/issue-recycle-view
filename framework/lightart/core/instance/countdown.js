// 修正小数点后的位数
function prefixInteger(num, n) {
    if (num > 9) {
        return num;
    } else {
        // 小于10的前面补零
        return (Array(n).join('0') + num).slice(-n);
    }
}

// 倒计时组件
export function countdown({ currentTime, leaveTime, endTime, format }) {
    currentTime = currentTime || new Date().getTime();
    leaveTime = leaveTime || endTime - currentTime;
    let timeObj = {};
    if (leaveTime > 0) {
        if (format && format.day) {
            timeObj.day = Math.floor(leaveTime / 1000 / 60 / 60 / 24);
        }
        if (format && format.hour) {
            // 如果format中没有设置day，则把它加到小时上去
            if (!format.day) {
                timeObj.hour = prefixInteger(Math.floor(leaveTime / 1000 / 60 / 60), 2);
            } else {
                timeObj.hour = prefixInteger(Math.floor(leaveTime / 1000 / 60 / 60 % 24), 2);
            }
        }
        if (format && format.min) {
            timeObj.min = prefixInteger(Math.floor(leaveTime / 1000 / 60 % 60), 2);
        }
        if (format && format.sec) {
            timeObj.sec = prefixInteger(Math.floor(leaveTime / 1000 % 60), 2);
        }
        if (format && format.millisec) {
            timeObj.millisec = Math.floor(leaveTime / 1000 % 10);
        }
        return timeObj;
    } else {
        timeObj = {
            day: '00',
            hour: '00',
            min: '00',
            sec: '00',
            millisec: 0,
        };
    }
    return timeObj;
}

export function initCountdown(vm) {
    vm._countdownHandler = null;
}

export function initCountdownNode(node) {
    if (node.dt === 'label' && /\$countdown\.tenth_second/.test(node.text)) {
        node._isCountdownLabel = true;
    }
    if (node.components) {
        for (let i = 0; i < node.components.length; i++) {
            initCountdownNode(node.components[i]);
        }
    }
}

export function countdownMixin(LightArt) {
    LightArt.prototype.$startCountdown = function () {
        const countDown = () => {
            // console.log('setTimeout countDown', this.isActive)
            if (this.isActive) {
                // debugger
                this.$emitAction('!countdown');
                this._countdownHandler = setTimeout(countDown, 1000);
            }
        };
        clearTimeout(this._countdownHandler);
        // 活动状态下才继续倒计时
        if (this.isActive) {
            countDown();
        }
    };
}
