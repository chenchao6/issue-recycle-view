import { initEvents } from './event';
import { initRender } from './render';
import { initAction } from './action';
import { initLifecycle } from './lifecycle';
import { initCountdown } from './countdown';

export function initOptions(vm, options) {
    vm.$ = options.$lightart;
    vm.$.head = vm.$.head || {};
    vm.$.head.datas = vm.$.head.datas || {};
    vm.$.head.templates = vm.$.head.templates || {};
    vm.$.head.events = vm.$.head.events || {};
    vm.$.head.actions = vm.$.head.actions || {};
    vm.$.head.globals = vm.$.head.globals || {};
    vm.$data = vm.$.head.datas.body || {};
    vm.$template = vm.$.head.templates.body || {};
    vm.body = vm.$.body;
    vm.onHref = options.onHref;
    vm.onStatistic = options.onStatistic;
    vm.onRender = options.onRender;
    vm.pages = [];  // section_list记录页数
    vm.rowIds = {}; // section_list的行的component_id记录，用于防止重复插入相同id的节点
    vm.defaultConf = options.defaultConf || {}; // 初始化自定义参数
}

export function initMixin(LightArt) {
    /**
     * 框架初始化
     * @param options
     * @param options.$lightart lightart数据
     * @private
     */
    LightArt.prototype._init = function (options) {
        // console.log('_init options:', options);
        if (!options || !options.$lightart) {
            return console.warn('fail to init with options:', options);
        }
        initEvents(this);
        initRender(this);
        initOptions(this, options);
        initAction(this);
        initLifecycle(this);
        initCountdown(this);

        this.$update({
            body: this.body,
            template: this.$template,
            data: this.$data,
            isInitRoot: true
        });

        // 初始化runtime、要放在$update后面、因为有些操作是依赖于vNode结构
        this._initRuntime();
        // console.log(this);
    };
}
