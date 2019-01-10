/**
 * VNode节点相关
 * @功能：
 *      根据节点数据创建节点树木VNode Tree
 *      创建VNode节点
 *      更新node节点信息
 */
import { removeItemOnRegexp, isPercent, isTrue } from '../util/index';
import { initCountdownNode } from '../instance/countdown';
// 节点id
let nodeId = 0;
/**
 * 创建可供渲染使用虚拟节点树
 * 功能：
 * 【section_list】
 * 循环node.components构建section和scroll_button，
 * 单个section包括section.header和section.components
 * 循环section.components构建section_list的行，并过滤component_id相同的行
 * 然后递归调用自身构建节点树
 *
 * 【非section_list】
 * 或者遇到node.components递归调用自身构建节点树
 * @export {function} buildVNodeTree
 * @param {Object} { vm lightart对象, node 节点树数据, parent 父节点}
 * @param {Object} [opt={}] 可选参数 {isAppend 是否插入}
 * @returns {Object} 可供渲染使用虚拟节点树
 */
export function buildVNodeTree({ vm, node, parent }, opt = {}) {
    const vNode = createVNode({ vm, node, parent },opt) || {};

    if (!node) {
        return;
    }

    if (node.dt === 'section_list') {
        if (node.v_gap) {
            vNode.vGapStyles = `width:${vm.$dip(node.v_gap)}`;
        }
        if (node.h_gap) {
            vNode.hGapStyles = `margin-top:${vm.$dip(node.h_gap)}`;
        }
        if (node.content_insets) {
            // top right bottom left
            const t = vm.$dip(node.content_insets.t || 0);
            const r = vm.$dip(node.content_insets.r || 0);
            const b = vm.$dip(node.content_insets.b || 0);
            const l = vm.$dip(node.content_insets.l || 0);
            vNode.insetStyles = `padding:${t} ${r} ${b} ${l}`;
        }
        if (node.sections) {
            // 因为要保持children的结构进行遍历时才方便，所以section和column都保持children
            vNode.children = [];
            vNode.appendList = {};
            for (let i = 0; i < node.sections.length; i++) {
                const section = node.sections[i];

                // sectionNode是渲染Node，section是原始section数据
                const sectionNode = {
                    // isSection: true, 暂时没有看到其他地方引用 先注释
                    children: []
                };
                vNode.children.push(sectionNode);

                // 一个section内的多列、默认1列
                section.column = section.column || 1;

                // section可以指定v_gap和h_gap，覆盖section_list的v_gap和h_gap
                if (section.v_gap) {
                    sectionNode.vGapStyles = `width:${vm.$dip(section.v_gap)}`;
                }
                if (section.h_gap) {
                    sectionNode.hGapStyles = `margin-top:${vm.$dip(section.h_gap)}`;
                }

                // content_insets
                if (section.content_insets) {
                    // top right bottom left
                    const t = vm.$dip(section.content_insets.t || 0);
                    const r = vm.$dip(section.content_insets.r || 0);
                    const b = vm.$dip(section.content_insets.b || 0);
                    const l = vm.$dip(section.content_insets.l || 0);
                    sectionNode.insetStyles = `padding:${t} ${r} ${b} ${l}`;
                }

                // header
                if (section.header) {
                    const headerNode = buildVNodeTree({
                        vm,
                        node: section.header,
                        parent: vNode
                    });
                    if (headerNode) {
                        sectionNode.header = headerNode;
                    }
                }

                if (section.components) {
                    for (let j = 0; j < section.components.length; j++) {
                        let itm = section.components[j];
                        if (opt.isAppend && itm.component_id && vm.rowIds[itm.component_id]) {
                            /**
                             * section_list的一个特性，发现component_id相同的行会过滤掉
                             * 业务功能：档期去重
                             */
                            console.log('重复的档期：' + itm.component_id);
                        } else {
                            const childNode = buildVNodeTree({
                                vm,
                                node: itm,
                                parent: vNode
                            });
                            // 将children分到不同列，暂时先平均分，瀑布布动态计算后续再加
                            const colIndex = j % section.column;
                            if (!sectionNode.children[colIndex]) {
                                sectionNode.children[colIndex] = [];
                            }
                            if (childNode) {
                                sectionNode.children[colIndex].push(childNode);
                            }
                            // 把component_id记录到当前lightart实例的rowIds
                            if (itm.component_id) {
                                vm.rowIds[itm.component_id] = {};
                            }
                        }
                    }
                }
            }
        }

        // scroll_button
        if (node.scroll_button) {
            const scrollButtonNode = buildVNodeTree({
                vm,
                node: node.scroll_button,
                parent: vNode
            });
            if (scrollButtonNode) {
                // 嗯、没错、写死
                scrollButtonNode.posStyles = `position:fixed; right:${vm.$dip(20)}; bottom: ${vm.$dip(20)}; z-index: 10000`;
                vNode.scrollButton = scrollButtonNode;
            }
        }
    } else {
        if (node.components) {
            vNode.children = [];
            for (let i = 0; i < node.components.length; i++) {
                const childNode = buildVNodeTree({
                    vm,
                    node: node.components[i],
                    parent: vNode
                });
                if (childNode) {
                    vNode.children.push(childNode);
                }
            }
        }
    }
    return vNode;
}
/**
 * 创建VNode
 * 功能：
 *  计算样式
 *  绑定SectionList或Flow的refresh和load_more的请求路径
 *  Countdown的初始化initCountdownNode
 *  绑定actions和statistics
 * @export {function} createVNode
 * @param {Object} { vm lightart对象, node 节点数据, parent 父节点 }
 * @param {Object}  [opt={}] 可选参数 {isUpdate 是否更新}
 * @returns {Object} 可供渲染使用虚拟节点VNode
 */
export function createVNode({ vm, node, parent },opt={}) {
    // 根据component_id去重，忽略新的同id节点
    if (!node || (vm._vNodes[node.component_id] && !opt.isUpdate)) {
        return null;
    }
    // 原生组件，原数据返回
    if (node.dt === 'native') {
        return node;
    }
    const vNode = {
        // 如果自带id就用模板的id
        id: node.component_id || ++nodeId,
        dt: node.dt,
        styles: [],
        sizeStyles: [],
        componentSizeStyles: [],
        posStyles: [],
        textStyles: [], // 因为-webkit-line-clamp无法继承、所以要拆出来
        classNames: ['la-component', `la-${node.dt}`],
        _isMounted: false,
    };

    // 处理尺寸
    node.bounds = node.bounds || {};
    if (node.bounds.l) {
        vNode.posStyles.push(`left:${vm.$dip(node.bounds.l)}`);
    }
    if (node.bounds.t) {
        vNode.posStyles.push(`top:${vm.$dip(node.bounds.t)}`);
    }
    if (node.bounds.w) {
        // 百分比需要设置在外面view上，component内不能。非百分比两者都要
        if (isPercent(node.bounds.w)) {
            vNode.componentSizeStyles.push(`width:${vm.$dip(node.bounds.w)}`);
        } else {
            vNode.sizeStyles.push(`width:${vm.$dip(node.bounds.w)}`);
        }
    }
    if (node.bounds.h) {
        if (isPercent(node.bounds.h)) {
            vNode.componentSizeStyles.push(`height:${vm.$dip(node.bounds.h)}`);
        } else {
            vNode.sizeStyles.push(`height:${vm.$dip(node.bounds.h)}`);
        }
    }

    // 处理圆角
    if (node.corner_radius) {
        // top-left top-right bottom-right bottom-left
        const lt = vm.$dip(node.corner_radius.lt || 0);
        const lb = vm.$dip(node.corner_radius.lb || 0);
        const rt = vm.$dip(node.corner_radius.rt || 0);
        const rb = vm.$dip(node.corner_radius.lb || 0);
        vNode.styles.push(`border-radius:${lt} ${rt} ${rb} ${lb}`);
    }

    // 处理边距（flow专有？）
    if (node.margin) {
        // top-left top-right bottom-right bottom-left
        const t = vm.$dip(node.margin.t || 0);
        const r = vm.$dip(node.margin.r || 0);
        const b = vm.$dip(node.margin.b || 0);
        const l = vm.$dip(node.margin.l || 0);
        vNode.styles.push(`margin:${t} ${r} ${b} ${l}`);
    }

    // 处理透明度
    if (node.alpha) {
        vNode.styles.push(`opacity:${node.alpha}`);
    }

    // 处理背景
    if (node.background) {
        if (node.background.image && node.background.image.url) {
            // todo: https统一替换开关
            vNode.styles.push(`background-image:url(${node.background.image.url})`);
        } else if (node.background.color) {
            vNode.styles.push(`background-color:${vm.$color(node.background.color)}`);
        }
    }

    // 处理边框
    if (node.border && node.border.width) {
        vNode.styles.push(`border:${vm.$dip(node.border.width)} solid ${vm.$color(node.border.color || '#ffffff')}`);
    }

    // 处理layout_align
    if (node.layout_align && parent && (parent.dt === 'block' || parent.dt === 'countdown')) {
        let transformText = '';
        if (node.layout_align.v) {
            removeItemOnRegexp(vNode.posStyles, /^top:/);
            switch (node.layout_align.v) {
                case 'start':
                    vNode.posStyles.push('top:0');
                    break;
                case 'center':
                    vNode.posStyles.push('top:50%');
                    transformText += 'translateY(-50%)';
                    break;
                case 'end':
                    vNode.posStyles.push('bottom:0');
                    break;
            }
        }
        if (node.layout_align.h) {
            removeItemOnRegexp(vNode.posStyles, /^left:/);
            switch (node.layout_align.h) {
                case 'start':
                    vNode.posStyles.push('left:0');
                    break;
                case 'center':
                    vNode.posStyles.push('left:50%');
                    transformText += ' translateX(-50%)';
                    break;
                case 'end':
                    vNode.posStyles.push('right:0');
                    break;
            }
        }
        if (transformText) {
            vNode.posStyles.push(`-webkit-transform:${transformText};transform:${transformText}`);
        }
    }

    // 处理通用样式
    if (node.z_index) {
        vNode.styles.push(`z-index:${node.z_index}`);
    }

    /**
     * SectionList
     */
    if (node.dt === 'section_list') {
        // refresh
        if (node.refresh) {
            vm.$addAction('!refresh', vNode.id, node.refresh);
        }
        // load_more todo：横向flow暂时没办法处理loadmore，因为scrollview和下拉刷新冲突
        if (node.load_more) {
            vm.$addAction('!load_more', vNode.id, node.load_more);
        }
    }

    /**
     * Label
     */
    if (node.dt === 'label') {
        vNode.text = node.text;
        // 处理字体
        if (node.font) {
            if (node.font.size) {
                vNode.textStyles.push(`font-size:${vm.$dip(node.font.size)}`);
            }
            if (node.font.family) {
                vNode.textStyles.push(`font-family:${node.font.family}`);
            }
            if (node.font.line_height) {
                vNode.textStyles.push(`line-height:${vm.$dip(node.font.line_height)}`);
            } else {
                // 特殊处理label高度和字体大小一样的情况，配置line-height为1，否则会有截断
                if (node.bounds.h === node.font.size) {
                    vNode.textStyles.push(`line-height:1`);
                }
            }
            if (node.font.color) {
                vNode.textStyles.push(`color:${vm.$color(node.font.color)}`);
            }
            if (node.font.italic) {
                vNode.classNames.push('la-s-italic');
            }
            if (node.font.bold) {
                vNode.classNames.push('la-s-bold');
            }
        }
        if (node.align) {
            switch (node.align.h) {
                case 'start':
                    vNode.classNames.push('la-s-tas');
                    break;
                case 'center':
                    vNode.classNames.push('la-s-tac');
                    break;
                case 'end':
                    vNode.classNames.push('la-s-tae');
                    break;
            }
            switch (node.align.v) {
                case 'start':
                    vNode.classNames.push('la-s-als');
                    break;
                case 'center':
                    vNode.classNames.push('la-s-alc');
                    break;
                case 'end':
                    vNode.classNames.push('la-s-ale');
                    break;
            }
        }
        // 处理多行文本
        if (node.max_lines) {
            vNode.textStyles.push(`-webkit-line-clamp:${node.max_lines}`);
        }
        // 处理文字截取
        if (!node.ellipsize || node.ellipsize === 'end') {
            vNode.classNames.push('la-s-ellipsis');
        }
        // 处理文字删除线
        if (isTrue(node.strikethrough)) {
            vNode.textStyles.push('text-decoration: line-through');
        }
        // 特殊处理
        if (node._isCountdownLabel) {
            // console.log('la-ms-label', vNode)
            vNode._isCountdownLabel = true;
            vNode.classNames.push('la-ms-label');
        }
    }
    /**
     * Image
     */
    if (node.dt === 'image') {
        // todo: default_url、error_url
        vNode.url = node.url;
        vNode.mode = node.scale_type === 'center' ? 'aspectFit' : 'aspectFill';
    }
    /**
     * Countdown
     */
    // todo：将这部分移到模板解析做或者模板解析去跳过
    if (node.dt === 'countdown') {
        if (node._isCountdownReady) {
            // console.log('countdown ready')
            vNode.classNames.push('la-is-countdown_ready');
            if (node._isCountdownRunning) {
                vNode.classNames.push('la-is-countdown_running');
            }
        } else {
            // console.log('countdown init')
            initCountdownNode(node);
            vm.$.head.templates[`countdown:${vNode.id}`] = node;
            vm.$addAction('!countdown', vNode.id, {
                start_time: node.start_time,
                end_time: node.end_time
            });
            // console.log('$startCountdown')
            node._isCountdownReady = true;
            // 延迟
            setTimeout(function () {
                vm.$startCountdown();
            }, 0);
        }
    }

    /**
     * Block
     */

    /**
     * Flow
     */
    if (node.dt === 'flow') {
        if (node.direction === 'horizontal') {
            vNode.classNames.push('la-dir-horizontal');
        } else {
            vNode.classNames.push('la-dir-vertical');
        }
        // refresh
        if (node.refresh) {
            vm.$addAction('!refresh', vNode.id, node.refresh);
        }
        // load_more todo：横向flow暂时没办法处理loadmore，因为scrollview和下拉刷新冲突
        if (node.load_more && node.direction !== 'horizontal') {
            vm.$addAction('!load_more', vNode.id, node.load_more);
        }
    }
    // 动作数据
    if (node.actions) {
        vNode.actions = node.actions;
    }
    // 埋点统计数据 for APP
    if (node.statistics) {
        vNode.statistics = node.statistics;
    }
    // 埋点所需的业务数据
    if (node.business) {
        vNode.business = node.business;
    }
    // 合成样式、避免模板计算
    vNode.classNames = vNode.classNames.join(' ');
    vNode.styles = vNode.styles.join(';');
    vNode.componentSizeStyles = vNode.componentSizeStyles.join(';');
    vNode.sizeStyles = vNode.sizeStyles.join(';');
    vNode.posStyles = vNode.posStyles.join(';');
    vNode.textStyles = vNode.textStyles.join(';');
    vNode.parentId = parent && parent.id;
    vm._vNodes[vNode.id] = vNode;
    return vNode;
}

/**
 * 更新node节点信息
 * @param oldVNode
 * @param newVNode
 * @param isDeep 深度更新
 */
export function updateVNode(oldVNode, newVNode, isDeep) {
    const keepList = ['children', 'id', 'parentId', 'isRoot', 'dt', '_isLoading'];
    for (let key in oldVNode) {
        if (oldVNode.hasOwnProperty(key) && keepList.indexOf(key) < 0) {
            delete oldVNode[key];
        }
    }
    for (let key in newVNode) {
        if (newVNode.hasOwnProperty(key) && keepList.indexOf(key) < 0) {
            oldVNode[key] = newVNode[key];
        }
    }
    // 深度更新
    if (isDeep && oldVNode.children && newVNode.children) {
        for (let i = 0, l = oldVNode.children.length; i < l; i++) {
            updateVNode(oldVNode.children[i], newVNode.children[i], isDeep);
        }
    }
}
