import axios from 'axios';
import qs from 'qs';
import { set, extend } from 'lodash';

import routes from './routes';

const library = (lib) => {

    // for each internal api route, create an http request that will call it
    const clientApiCalls = routes.reduce((api, route) => {

        const clientCall = (config) => {
            const apiPort = lib.store.getState().config.renderer.api.port;

            // remove http metadata from function inputs
            const inputs = extend(config);
            delete inputs.ip;

            const inputType = route.method === 'GET'
                ? 'params'
                : 'data';

            const httpEncodedInput = inputType === 'params'
                ? qs.stringify(inputs)
                : inputs;

            return axios({
                method: route.method,
                url: `http://${config.ip || 'localhost'}:${apiPort}/${route.path}`,
                [inputType]: httpEncodedInput,
                json: true
            })
            .then((response) => response.data);
        }

        // store the api call in the api hierarchy
        set(api, route.name, clientCall);

        return api;
    }, {});

    return clientApiCalls;
}

export default library;
