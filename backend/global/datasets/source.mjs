export default {
    type(source) {
        if (typeof source === 'string') {
            if (/^(\s+|)\(((.*|\d|\D)+?)(\)(\s+|))$/.test(source)) {
                return 'jsonata-query';
            } else if (source.endsWith('.jsonata')) {
                return 'jsonata-file';
            } else if (source.endsWith('.yaml') || source.endsWith('.json')) {
                return 'data-file';
            } else {
                return 'id';
            }
        } else if (typeof source === 'object') {
            return 'data-object';
        } else {
            return undefined;
        }
    }
};
