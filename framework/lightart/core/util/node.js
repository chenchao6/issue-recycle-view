export function deepSetKeyValue(target, nextKey, key, value) {
    let nextTarget;
    if (Array.isArray(target)) {
        nextTarget = target;
    } else {
        target[key] = value;
        nextTarget = target[nextKey];
    }
    if (nextTarget) {
        for (let i = 0; i < nextTarget.length; i++) {
            deepSetKeyValue(nextTarget[i], nextKey, key, value);
        }
    }
}

export function findValueByPath(_path, currentNode) {
    const path = _path.split('.');
    const arrRegexp = /^([\w-]+)\[(\d+)\]$/;
    for (let i = 0; i < path.length; i++) {
        if (path[i].charAt(path[i].length - 1) === ']') {
            const pos = arrRegexp.exec(path[i]);
            currentNode = currentNode[pos[1]];
            if (currentNode) {
                currentNode = currentNode[pos[2]];
            }
        } else {
            currentNode = currentNode[path[i]];
        }
        // null and undefined
        if (currentNode == null) {
            return undefined;
        }
    }
    // console.log('currentNode', currentNode)
    return currentNode;
}

// 备注：不能准确识别目标值就是null的情况
export function replaceValueByPath(_path, currentNode, newValue) {
    const path = _path.split('.');
    const arrRegexp = /^([\w-]+)\[(\d+)\]$/;
    let lastNode;
    let lastPath;
    // debugger
    for (let i = 0; i < path.length; i++) {
        if (path[i].charAt(path[i].length - 1) === ']') {
            const pos = arrRegexp.exec(path[i]);
            currentNode = currentNode[pos[1]];
            if (currentNode) {
                lastPath = pos[2];
                lastNode = currentNode;
                currentNode = currentNode[pos[2]];
            }
        } else {
            lastPath = path[i];
            lastNode = currentNode;
            currentNode = currentNode[path[i]];
        }
        // null and undefined
        if (currentNode == null) {
            return false;
        }
    }
    if (lastNode != null && lastPath !== null) {
        lastNode[lastPath] = newValue;
        return true;
    } else {
        return false;
    }
}
