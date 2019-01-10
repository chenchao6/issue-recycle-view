import { deepSetKeyValue, findValueByPath } from '../../../core/util/index';
const onfire = require('../../../../../utils/onfire');
export function renderMixin(LightArt) {
    LightArt.prototype._addCompoent = function(id, component) {
        this._components[id] = component;
    };

    LightArt.prototype._removeCompoent = function(id) {
        delete this._components[id];
    };

    // 删除重新渲染时被替换的组件引用
    LightArt.prototype._removeRender = function({
        vNode,
        isDeep,
        isNotRemoveThis
    }) {
        // todo 问题: 真正生效是在setData新数据后、期间对改_components的操作会失败
        // console.log(isRemoveThis,vNode.id)
        if (!isNotRemoveThis) {
            this.$removeActionByKey(vNode.id);
            delete this._components[vNode.id];
            // 直接vNode引用也需要删除
            delete vNode.parentId;
            delete this._vNodes[vNode.id];
            // 删除倒计时存储模板
            if (vNode.dt === 'countdown') {
                delete this.$.head.templates[`countdown:${vNode.id}`];
            }
            vNode._isMounted = false;
        }
        if (isDeep && vNode.children) {
            for (let i = 0; i < vNode.children.length; i++) {
                this._removeRender({ vNode: vNode.children[i], isDeep });
            }
        }
    };

    // vNode, template, data, body, isAppend
    LightArt.prototype.$update = function({
        vNodeId,
        path,
        template,
        data,
        body,
        isAppend,
        isReplace,
        isUpdate,
        isInitRoot
    }) {
        let vNode;
        // 初始渲染全部节点
        if (isInitRoot) {
            this.vdom = vNode = this._render({
                template,
                data,
                body,
                isReplace: true
            });
            // console.log(vNode);
            this.vdom.isRoot = true;
            // console.log(new Date().getTime())
            // 二次渲染
        } else {
            if (vNodeId) {
                vNode = this._vNodes[vNodeId];
            }
            if (path) {
                vNode = findValueByPath(path, this.vdom);
                if (!vNode) {
                    console.warn('can not find VNode by path:', path);
                }
            }
            if (vNode) {
                /**
                 * TODO:这里就是2次插入档期会执行的_render方法
                 * 遍历vNode.children.children的id属性
                 * 与data.floor_list的子元素的data.brand.brand_id一一对比
                 * 剔除id一样的再做_render
                 */
                vNode = this._render({
                    vNode,
                    template,
                    data,
                    body,
                    isAppend,
                    isReplace,
                    isUpdate
                });
                const component = this._components[vNode.id];
                if (
                    isAppend &&
                    component &&
                    component.data &&
                    component.data.node.dt == 'section_list'
                ) {
                    // 记录原始数组的长度
                    let curLen = component.data.count;
                    // 记录新数组的长度
                    let lastLen = vNode.children.length;
                    let st =Date.now();
                    console.log(`${curLen}###${lastLen}`);

                    // 实现行号
                    for (let i in vNode.children) {
                        let section = vNode.children[i];
                        let component_id_arr=[];
                        for (let j in section.children) {
                            for(let k in section.children[j]){
                                let itm =section.children[j][k];
                                if (itm.component_id) {
                                    component_id_arr.push(itm.component_id);
                                }
                                else if (itm.id) {
                                    component_id_arr.push(itm.id);
                                }else {
                                    console.log(itm);
                                }

                            }

                        }

                        section.component_id=component_id_arr.join(',');
                    }

                    let appendChildren = JSON.parse(JSON.stringify(vNode.children));
                     let appendChildrenx = appendChildren.slice(curLen-1,lastLen-1);
                     let arr =[]
                     for(let i = 1; i< appendChildrenx.length; i++){
                         // appendChildrenx[i].__index__ = i + curLen -1;
                         // console.log( i + curLen -1);
                         arr.push(appendChildrenx[i])
                     }
                    component.ctx.append(arr, function () {
                        // 新增加的数据渲染完毕之后, 触发的回调
                        component.data.count = component.data.count + arr.length;
                        console.log(arr);
                        console.log('【render】 use time', Date.now() - st);
                        // 通知加载成功事件
                        onfire.fire('la_loadmore_flag');
                        // fntry();
                    });
                    // 获取初始页数 从0开始
                    // let pageLen = this.pages.length;
                    // pageLen = !pageLen ? 0 : pageLen + 1;
                    // this.pages.push(pageLen);
                    // // 记录原始数组的长度
                    // let curLen =
                    //     component.data.curLen ||
                    //     component.data.node.children.length;
                    // // 记录新数组的长度
                    // let lastLen = vNode.children.length;
                    // // 建立追加列表
                    // let appendList = [];
                    // for (let i = curLen; i < lastLen; i++) {
                    //     vNode.children[i].appendRow = i;
                    //     appendList.push(vNode.children[i]);
                    // }
                    // // setData利用索引更新，性能更好
                    // let index = this.pages.length - 1;
                    //
                    // component.setData(
                    //     {
                    //         curLen: lastLen,
                    //         pages: this.pages,
                    //         ['node.appendList.' + index]: appendList
                    //     },
                    //     () => {
                    //         // 通知加载成功事件
                    //         onfire.fire('la_loadmore_flag');
                    //     }
                    // );
                } else {
                    if (component) {
                        component.setData({
                            node: vNode
                        });
                    }
                }
            }
        }
        if (vNode) {
            deepSetKeyValue(vNode, 'children', '_isMounted', true);
        }
        // console.log('$update', vNode)
    };
}
