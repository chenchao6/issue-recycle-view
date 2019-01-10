import { isObject, findValueByPath } from '../core/util/index';
import { parse } from './parser';

// 工具方法、查找对象的第一个kei出来
function findObjectFirstKey(obj) {
    return isObject(obj) && Object.keys(obj)[0];
}

export default {
    existValueRG: /{{#\?.+?}}/,
    keyRE: /^{{#(\S+)\s?(.*)}}$/,
    ifRE: /^{{#(?:else)?if\s+(.*)}}$/,
    // elseifRE: /^{{#elseif\s+(.*)}}$/,
    elseRE: /^{{#else}}$/,
    /**
     * 合并模板和data
     * @param template
     * @param data
     * @param preCheck
     * @returns {*}
     */
    render(template, data, preCheck) {
        // console.log(template, data);
        const preCheckAns = preCheck && preCheck(template, data);
        // 预检查不需要处理的节点
        if (preCheckAns === false) {
            return JSON.parse(JSON.stringify(template));
        }
        if (isObject(template)) {
            let ans = {};
            let key;
            // 对象需要遍历处理里面的数据
            for (let i in template) {
                if (template.hasOwnProperty(i)) {
                    // 特殊模板key
                    if (key = this.keyRE.exec(i)) {
                        let path;
                        let target;
                        switch (key[1]) {
                            case 'each':
                                path = key[2];
                                target = findValueByPath(path, data);
                                ans = [];
                                if (target && target.length) {
                                    for (let j = 0; j < target.length; j++) {
                                        const itemAns = this.render(template[i], { ...target[j], $index: j }, preCheck)
                                        itemAns && ans.push(itemAns);
                                    }
                                }
                                break;
                        }
                        // 常规值
                    } else {
                        const value = this.render(template[i], data, preCheck);
                        // 可选操作符 {{#? notifications.home}} 如果匹配了就是具体的值，如果没匹配会原样返回，将其删除
                        if (!this.existValueRG.test(value)) {
                            ans[i] = value;
                        }
                    }
                }
            }
            return ans;
            // 数组对象需要递归处理
        } else if (Array.isArray(template)) {
            // 判断是否 #if 数组
            let inIfCondition = false;//template[0] && this.ifRE.exec(template[0]);
            // 这个蛋疼的结构要遍历多层、先判断是否是#if句型
            if (template[0]) {
                inIfCondition = this.ifRE.test(findObjectFirstKey(template[0]));
            }
            if (inIfCondition) {
                let ans = null;
                for (let i = 0, l = template.length; i < l; i++) {
                    const objectKey = findObjectFirstKey(template[i]);
                    const ifCondition = this.ifRE.exec(objectKey);
                    const isMatchIf = ifCondition && ifCondition[1] && parse(ifCondition[1], data);
                    // if和elseif合并，因为逻辑一样顺序判断
                    if (isMatchIf) {
                        return this.render(template[i][objectKey], data, preCheck);
                    }
                    // 匹配可能在末尾的 #else
                    if (i === l - 1 && this.elseRE.test(objectKey)) {
                        return this.render(template[i][objectKey], data, preCheck);
                    }
                }
                return ans;
            } else {
                let ans = [];
                for (let i = 0; i < template.length; i++) {
                    // 问题：需要保证data是对象，如果是数组可能有问题
                    ans.push(this.render(template[i], { ...data, $index: i }, preCheck));
                }
                return ans;
            }
            // 其它情况直接尝试获取值
        } else {
            return parse(template, data, { notInExpContext: true });
        }
    }
};
