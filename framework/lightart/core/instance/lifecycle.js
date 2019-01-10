export function initLifecycle(vm) {
    vm.isActive = true;
}

export function lifecycleMixin(LightArt) {
    LightArt.prototype.$onShow = function () {
        this.isActive = true;
        // 继续暂停的倒计时
        if (this._countdownHandler) {
            this.$startCountdown();
        }
        this.$emit('start_native_countdown');
    };
    LightArt.prototype.$onHide = function () {
        this.isActive = false;
        this.$emit('clear_native_countdown');
    };
}
