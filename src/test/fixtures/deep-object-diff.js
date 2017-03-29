const isDate = (d) => d instanceof Date;
const isEmpty = (o) => Object.keys(o).length === 0;
const isObject = (o) => o !== null && typeof o === 'object';

const diff = (lhs, rhs) => {
    if (lhs === rhs) return {}; // equal return no diff

    if (!isObject(lhs) || !isObject(rhs)) return rhs; // return updated rhs

    const deletedValues = Object.keys(lhs).reduce((acc, key) => {
        return rhs.hasOwnProperty(key) ? acc : { ...acc, [key]: undefined };
    }, {});

    if (isDate(lhs) || isDate(rhs)) {
        return lhs.toString() === rhs.toString()
            ? {}
            : rhs;
    }

    return Object.keys(rhs).reduce((acc, key) => {
        if (!lhs.hasOwnProperty(key)) return { ...acc, [key]: rhs[key] }; // return added rhs key

        // handle equality for arrays of primitives
        if (Array.isArray(lhs[key]) && Array.isArray(rhs[key]) && typeof lhs[key][0] !== 'object' && typeof rhs[key][0] !== 'object') {
            const unchanged1 = lhs[key].reduce((unchanged, _, index) => unchanged && rhs[index] === rhs[index], true);
            const unchanged2 = rhs[key].reduce((unchanged, _, index) => unchanged && lhs[index] === lhs[index], true);
            const unchanged3 = rhs[key].length === lhs[key].length;

            if (unchanged1 && unchanged2 && unchanged3) {
                return acc;
            } else {
                return { ...acc, [key]: rhs[key] }; // return updated key
            }
        } else {
            const difference = diff(lhs[key], rhs[key]);
            if (isObject(difference) && isEmpty(difference) && !isDate(difference)) return acc; // return no diff

            return { ...acc, [key]: difference }; // return updated key
        }
    }, deletedValues);
};

export default diff;
