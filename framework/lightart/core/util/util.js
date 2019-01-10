const toString = Object.prototype.toString;

export function isUndef(v) {
    return v === undefined || v === null;
}

export function isDef(v) {
    return v !== undefined && v !== null;
}

export function isObject(v) {
    return toString.call(v) === '[object Object]';
}

export function isPercent(v) {
    return /%/.test(v);
}

export function noop() {
}

export function once(fn) {
    let called = false;
    return function (...args) {
        if (!called) {
            called = true;
            fn.apply(this, args);
        }
    };
}

export function extend(to, from) {
    for (const key in from) {
        to[key] = from[key];
    }
    return to;
}


export function removeItemOnRegexp(arr, reg) {
    for (let i = 0; i < arr.length; i++) {
        if (reg.test(arr[i])) {
            arr.splice(i--, 1);
        }
    }
}

export function toArray(list, start) {
    start = start || 0;
    let i = list.length - start;
    const ret = new Array(i);
    while (i--) {
        ret[i] = list[i + start];
    }
    return ret;
}
/**
 * 判断是否为真 true 'true'
 * @param {*} v 
 */
export function isTrue(v) {
    return (!!v && v!= 'false') || v == 'true';
}

/**
 * 删除http:和https:头，统一用https:
 * @param {源url} sourceUrl
 */
export function httpsUrl(sourceUrl) {
    return sourceUrl && sourceUrl.replace(/^(?:https?:)?\/\//i, 'https://');
};