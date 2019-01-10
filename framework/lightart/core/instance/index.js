import { initMixin } from './init';
import { renderMixin } from './render';
import { eventsMixin } from './event';
import { actionMixin } from './action';
import { countdownMixin } from './countdown';
import { lifecycleMixin } from './lifecycle';

const instances = {};
let vmId = 0;

/**
 * 实例化lightart对象的入口方法
 *
 * @param {object} options 可选参数 {}
 */
function LightArt(options) {
    this.id = ++vmId;
    instances[this.id] = this;
    this._init(options);
}
LightArt.get = function (id) {
    return instances[id];
};
LightArt.$emit = function (...args) {
    for (let id in instances) {
        const instance = instances[id];
        instance.$emit.apply(instance, args);
    }
};

initMixin(LightArt);
eventsMixin(LightArt);
renderMixin(LightArt);
actionMixin(LightArt);
countdownMixin(LightArt);
lifecycleMixin(LightArt);

export default LightArt;
