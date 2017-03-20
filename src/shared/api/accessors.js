import axios from 'axios';
import { set } from 'lodash';

import routes from './routes';

const library = (lib) => {

    // for each internal api route, create a function that will call it externally
    const clientApiCalls = routes.reduce((api, route) => {

        const clientCall = (config) => {
            const apiPort = lib.store.getState().config.renderer.api.port;

            return axios({
                ...config,
                method: route.method,
                url: `http://${config.ip || 'localhost'}:${apiPort}/${route.path}`
            });
        }

        // store the api call in the api hierarchy
        set(api, route.name, clientCall);

        return api;
    }, {});

    return clientApiCalls;
}

export default library;
