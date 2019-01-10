/**
 * 渲染相关<br>
 * @功能：
 * 渲染虚拟dom树
 * 解析st模板
 * 颜色转换 #AARRGGBB -> rgba(r,g,b,a)
 */
import LT from '../../compiler/lt';
import { buildVNodeTree, updateVNode } from '../vdom/vnode';
import { SYS_INFO, SCREEN_INFO } from '../constants';

export function initRender(vm) {
    vm._vNodes = Object.create(null);
    vm.vdom = [];
}

export function renderMixin(LightArt) {
    /**
     * 渲染虚拟dom树
     * @param vNode 旧的vNode节点
     * @param template
     * @param data
     * @param body
     * @param isAppend // 追加子节点
     * @param isReplace // 替换子节点
     * @param isUpdate // 更新子节点
     * @private
     */
    LightArt.prototype._render = function({
        vNode,
        template,
        data,
        body,
        isAppend,
        isReplace,
        isUpdate
    }) {
        if(isUpdate){
            // console.log('isUpdate!!');
        }
        if (!body) {
            body = this._parseTemplate(template, data);
            if (!body) {
                console.warn(`fail to render: ${this.id}`);
                return false;
            }
        }
        const newVNode = buildVNodeTree({ vm: this, node: body},{isAppend:isAppend,isUpdate:isUpdate});
        if (vNode) {
            const target = vNode.children;
            const newVNodes = newVNode && newVNode.children;
            if (newVNodes) {
                // 新增子元素
                if (isAppend) {
                    /**
                     * 这里也可以移除newVNodes的children.children与target（原section_list）的id一致
                     */
                    newVNodes.forEach(node => {
                        node.parentId = vNode.id;
                    });
                    newVNodes.unshift(target.length, 0);

                    target.splice.apply(target, newVNodes);
                    updateVNode(vNode, newVNode);
                    // 替换节点
                } else if (isReplace) {
                    // 直接替换才需要删除被替换的节点Component
                    this._removeRender({
                        vNode,
                        isDeep: true,
                        isNotRemoveThis: true
                    });
                    newVNodes.unshift(0, target.length);

                    target.splice.apply(target, newVNodes);
                    updateVNode(vNode, newVNode);
                    // 更新节点属性
                } else if (isUpdate) {
                    updateVNode(vNode, newVNode, true);
                }
                // 删除临时节点引用、避免同id更新时
                if (newVNode.id !== vNode.id) {
                    delete this._vNodes[newVNode.id];
                } else {
                    // 同节点更新的时候、需要重置VNodes的指向，因为新节点会覆盖旧节点
                    this._vNodes[newVNode.i] = vNode;
                }
            } else {
                // 只更新单个节点的情况
                updateVNode(vNode, newVNode);
            }
        }
        return vNode || newVNode;
    };

    /**
     * 解析st模板
     * @param template
     * @param data
     * @private
     */
    LightArt.prototype._parseTemplate = function(template = {}, data = {}) {
        // console.log('_parseTemplate', template, data)
        return LT.render(
            template,
            {
                $: this.$,
                $body: this.$body,
                $template: this.$template,
                $sys: SYS_INFO,
                $screen: SCREEN_INFO,
                ...data
            },
            template => {
                if (template) {
                    if (template.dt && template.component_id) {
                        // 因为合并会更新源模板，所以保存最原始的模板要深克隆
                        // 潜规则：带有component_id的component是要重复利用的模板
                        // console.log(JSON.stringify(template))
                        this.$.head.templates[
                            template.component_id
                        ] = JSON.parse(JSON.stringify(template));
                    } else if (
                        template.dt === 'action' &&
                        template.name === '!update'
                    ) {
                        // console.log(template)
                        return false;
                    }
                }
            }
        );
    };

    /**
     * 颜色转换 #AARRGGBB -> rgba(r,g,b,a)
     * @param color
     * @returns {*}
     */
    LightArt.prototype.$color = function(color) {
        if (/^#[0-9a-f]{8}/i.test(color)) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            const a = (parseInt(color.slice(7), 16) / 255).toFixed(2);
            return `rgba(${r},${g},${b},${a})`;
        }
        return color;
    };
}
