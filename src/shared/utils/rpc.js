import { rpc } from 'electron-simple-rpc';

const wrap = (scope, namespace) => (fn) => rpc(scope, `${namespace}.${fn}`)

const translate = (library) => Object.keys(library).reduce((remote, fn, index, functions) => {
    remote[fn] = library[fn](fn);
    return remote;
}, {});

export default {
    wrap,
    translate
};
