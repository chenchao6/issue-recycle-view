import { findValueByPath } from '../core/util/index';

export const pureValueRE = /^{{(?:#\?)?\s*([^{}]+?)\s*?}}$/;
export const valueRE = /{{\s*(\S+?)\s*?}}/g;

export const notRE = /^{{\s*!(.+?)}}/;
export const identityRE = /^{{\s*(.+?)===(.+?)}}/;
export const equalRE = /^{{\s*(.+?)==(.+?)}}/;
export const bigEqualRE = /^{{\s*(.+?)>=(.+?)}}/;
export const bigRE = /^{{\s*(.+?)>(.+?)}}/;
export const smallEqualRE = /^{{\s*(.+?)<=(.+?)}}/;
export const smallRE = /^{{\s*(.+?)<(.+?)}}/;
export const stringLiteral = /^('|")(.*)\1$/

/**
 * @param value
 * @param rootData
 * @param options.notInExpContext 是否不在表达式内，非表达式内需要设为false
 * @return {*}
 */
export function getValue(value, rootData, options = {}) {
    const data = { ...rootData, $root: rootData };
    // 需要全局正则，全局正则多次使用要重置lastIndex
    valueRE.lastIndex = 0;
    if (typeof value === 'string') {
        if (!options.notInExpContext && stringLiteral.test(value)) {
            return value.replace(stringLiteral, function (a, b, c) {
                return c;
            });
        }
        // 单纯的值要保留原来的类型（string|number）、混合的统一转成string
        let exec;
        // 表达式内只支持简单的
        const newValue = options.notInExpContext ? value : `{{${value}}}`;
        // console.log(newValue, data, pureValueRE.exec(newValue))
        if ((exec = pureValueRE.exec(newValue)) && exec && exec[1]) {
            const findValue = findValueByPath(exec[1], data);
            // 注意这里要加这个后备，如果没有找到值，要原样返回后续处理
            // null or undefined
            return findValue == null ? value : findValue;
        }
        if (valueRE.test(value)) {
            valueRE.lastIndex = 0;
            return value.trim().replace(valueRE, (a, b) => {
                let ans = findValueByPath(b, data);
                const type = typeof ans;
                // 可渲染的是基础值
                if (type === 'number' || type === 'string') {
                    return ans;
                } else {
                    return a;
                }
            });
        }
    }
    return value;
}

/**
 * 表达式解析：
 * 一元：
 * !
 * 二元：
 * ==
 * ===
 * +
 * -
 * *
 * %
 * /
 * >
 * <
 * >=
 * <=
 * 三元：
 * ?:
 *
 * 第一期支持：
 * !
 * ==
 * ===
 * >
 * <
 * >=
 * <=
 */

export function parse(template = '', data, options = {}) {
    // 注意：被包含的需要放在后面，比如==放在===后面，>放在>=后面
    // const ast = getAST(template);
    if (!options.notInExpContext) {
        template = `{{${template}}}`;
    }
    // 处理字符串空格
    let args;
    // !
    if ((args = notRE.exec(template)) && args[1]) {
        return !getValue(args[1].trim(), data);
    }
    // ===
    if ((args = identityRE.exec(template)) && args[1] && args[2]) {
        const left = getValue(args[1].trim(), data);
        const right = getValue(args[2].trim(), data);
        // console.log('===', left, right, left === right);
        return left === right;
    }
    // ==
    if ((args = equalRE.exec(template)) && args[1] && args[2]) {
        const left = getValue(args[1].trim(), data);
        const right = getValue(args[2].trim(), data);
        // console.log('==', left, right, left == right);
        return left == right;
    }
    // >=
    if ((args = bigEqualRE.exec(template)) && args[1] && args[2]) {
        const left = getValue(args[1].trim(), data);
        const right = getValue(args[2].trim(), data);
        // console.log('>=', left, right, left >= right);
        return left >= right;
    }
    // >
    if ((args = bigRE.exec(template)) && args[1] && args[2]) {
        const left = getValue(args[1].trim(), data);
        const right = getValue(args[2].trim(), data);
        // console.log('>', left, right, left > right);
        return left > right;
    }
    // <=
    if ((args = smallEqualRE.exec(template)) && args[1] && args[2]) {
        const left = getValue(args[1].trim(), data);
        const right = getValue(args[2].trim(), data);
        // console.log('<=', left, right, left <= right);
        return left <= right;
    }
    // <
    if ((args = smallRE.exec(template)) && args[1] && args[2]) {
        const left = getValue(args[1].trim(), data);
        const right = getValue(args[2].trim(), data);
        // console.log('<', left, right, left < right);
        return left < right;
    }
    return getValue(template, data, { notInExpContext: true });
}

// export function getAST(template) {
//     const templateArr = template.trim().split(/\s+/);
//     const ast = {
//         arr: templateArr
//     };
//     return ast;
// }

