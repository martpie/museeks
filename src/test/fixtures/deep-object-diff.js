import { difference as arrayDiff } from 'lodash';

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

if (key === 'history') {
    console.log(key, 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY')
    console.log(rhs[key])
}

        let difference;

        if (Array.isArray(lhs[key]) && Array.isArray(rhs[key]) && typeof lhs[key][0] !== 'object' && typeof rhs[key][0] !== 'object') {
            difference = rhs[key];
        } else {
            difference = diff(lhs[key], rhs[key]);
        }

        if (isObject(difference) && isEmpty(difference) && !isDate(difference)) return acc; // return no diff

        return { ...acc, [key]: difference }; // return updated key
    }, deletedValues);
};

export default diff;
