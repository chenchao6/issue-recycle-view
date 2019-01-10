import {
    toArray
} from '../util/index';

export function initEvents(vm) {
    vm._events = Object.create(null);
}

export function eventsMixin(LightArt) {
    const hookRE = /^#/;
    LightArt.prototype.$on = function (event, fn) {
        const vm = this;
        if (Array.isArray(event)) {
            for (let i = 0, l = event.length; i < l; i++) {
                this.$on(event[i], fn);
            }
        } else {
            (vm._events[event] || (vm._events[event] = [])).push(fn);
            // optimize hook:event cost by using a boolean flag marked at registration
            // instead of a hash lookup
            if (hookRE.test(event)) {
                vm._hasHookEvent = true;
            }
        }
        return vm;
    };

    LightArt.prototype.$once = function (event, fn) {
        const vm = this;
        function on() {
            vm.$off(event, on);
            fn.apply(vm, arguments);
        }
        on.fn = fn;
        vm.$on(event, on);
        return vm;
    };

    LightArt.prototype.$off = function (event, fn) {
        const vm = this;
        // all
        if (!arguments.length) {
            initEvents(vm);
            return vm;
        }
        // array of events
        if (Array.isArray(event)) {
            for (let i = 0, l = event.length; i < l; i++) {
                this.$off(event[i], fn);
            }
            return vm;
        }
        // specific event
        const cbs = vm._events[event];
        if (!cbs) {
            return vm;
        }
        if (arguments.length === 1) {
            vm._events[event] = null;
            return vm;
        }
        // specific handler
        let cb;
        let i = cbs.length;
        while (i--) {
            cb = cbs[i];
            if (cb === fn || cb.fn === fn) {
                cbs.splice(i, 1);
                break;
            }
        }
        return vm;
    };

    LightArt.prototype.$emit = function (event) {
        const vm = this;
        let cbs = vm._events[event];
        if (cbs) {
            cbs = cbs.length > 1 ? toArray(cbs) : cbs;
            const args = toArray(arguments, 1);
            for (let i = 0, l = cbs.length; i < l; i++) {
                try {
                    cbs[i].apply(vm, args);
                } catch (e) {
                    console.error(e);
                }
            }
        }
        return vm;
    };
}
