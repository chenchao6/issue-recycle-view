export function initAction(vm) {
    vm._actions = Object.create(null);
}

export function actionMixin(LightArt) {
    /**
     * 触发statistic埋点
     * @param type 类型
     * @param statistic statistic参数
     * @param opt 自定义参数
     */
    LightArt.prototype.$statistic = function (type = 'click', statistic = {}, opt = {}) {
        if (this.onStatistic) {
            this.onStatistic(type, statistic, opt);
        }
    };
    /**
     * 触发action
     * @param options action参数
     * @param $ret 传递给下一个actin的值
     */
    LightArt.prototype.$action = function (options = {}, $ret) {
        // console.log(options, $ret)
        // options = LT.render(options, {
        //     $: this.$,
        //     $body: this.$body,
        //     $template: this.$template,
        //     $ret
        // }, template => {
        //     if(template.dt && template.id){
        //         // 因为合并会更新源模板，所以保存最原始的模板要深克隆
        //         // console.log(template)
        //         this.$.head.templates[template.id] = JSON.parse(JSON.stringify(template))
        //     }
        // })
        // console.log(options)
        options.params = options.params || {};
        switch (options.name) {
            case '!href':
                if (this.onHref && options.params.url) {
                    this.onHref(options.params.url);
                    if (options.success) {
                        // 串联action
                        this.$action(options.success);
                    }
                }
                break;
            case '!request':
                if (options.params.url) {
                    this.$ajax({
                        url: options.params.url,
                        method: options.params.method ? options.params.method.toUpperCase() : 'GET',
                        header: options.params.headers,
                        parameters: options.params.data,
                    }).then(res => {
                        if (res && res.data && options.success) {
                            // 串联action
                            this.$action(options.success, res.data);
                        }
                    });
                }
                break;
            case '!update':
                // todo: 修改新update
                if (options.params.alters && options.params.alters.length) {
                    for (let i = 0; i < options.params.alters.length; i++) {
                        const alter = options.params.alters[i];
                        // debugger
                        if (alter.id) {
                            this.$update({
                                vNodeId: alter.id,
                                template: alter.template || this.$.head.templates[alter.id],
                                data: {
                                    $ret,
                                    ...alter.data
                                },
                                isReplace: true
                            });
                        }
                    }
                    if (options.success) {
                        // 串联action
                        this.$action(options.success);
                    }
                }
                break;
        }
    };
    
    /**
     * 初始化action
     * @param actionName 动作名
     * @param beforeAction 预检查action、如果想跳过的节点return false
     * @param afterAction 正式action，复杂的操作放到这里
     * @param noAction 没有action的回调
     */
    LightArt.prototype.$onAction = function (actionName, beforeAction, afterAction, noAction) {
        this._actions[actionName] = this._actions[actionName] || Object.create(null);
        this.$on(`action:${actionName}`, (event) => {
            const actions = this._actions[actionName];
            // console.log('action:', actionName, event, actions, this._actions)
            const actionKeys = Object.keys(actions);
            if (actionKeys.length) {
                actionKeys.forEach(key => {
                    const actionValue = actions[key];
                    const beforeActionReturn = beforeAction ? beforeAction({
                        actionName,
                        key,
                        actionValue,
                        event
                    }) : null;
                    if (beforeActionReturn !== false) {
                        afterAction && afterAction({ actionName, key, actionValue, event });
                    }
                });
            } else {
                noAction && noAction();
            }
        });
    };
    
    /**
     * 注销action
     * @param actionName 动作名
     */
    LightArt.prototype.$offAction = function (actionName) {
        this.$off(`action:${actionName}`);
    };
    
    /**
     * 触发action
     * @param actionName 动作名
     * @param event 事件
     */
    LightArt.prototype.$emitAction = function (actionName, event) {
        this.$emit(`action:${actionName}`, event);
    };
    
    /**
     * 注册action
     * @param actionName 动作名
     * @param key 动作元素key标识、一般为节点id
     * @param actionValue 注册动作数据
     */
    LightArt.prototype.$addAction = function (actionName, key, actionValue) {
        this._actions[actionName] = this._actions[actionName] || Object.create(null);
        this._actions[actionName][key] = actionValue;
    };
    
    /**
     * 删除action
     * @param actionName 动作名
     * @param key 动作元素key标识、一般为节点id
     */
    LightArt.prototype.$removeAction = function (actionName, key) {
        if (this._actions[actionName]) {
            delete this._actions[actionName][key];
        }
    };
    
    /**
     * 删除action
     * @param key 动作元素key标识、一般为节点id
     */
    LightArt.prototype.$removeActionByKey = function (key) {
        Object.keys(this._actions).forEach(actionName => {
            delete this._actions[actionName][key];
        });
    };
}
