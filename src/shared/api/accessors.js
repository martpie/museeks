import axios from 'axios';
import qs from 'qs';
import { set } from 'lodash';
import extend from 'xtend';

import routes from './routes';

const library = (lib) => {

    // for each internal api route, create an http request that will call it
    const clientApiCalls = routes.reduce((api, route) => {

        const clientCall = (config) => {

            // remove peer metadata from function inputs
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
                url: `${lib.utils.peerEndpoint(config)}/${route.path}`,
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
