import axios from 'axios';
import { set } from 'lodash';
import utils from '../utils/utils';

import routes from './routes';

const library = (lib) => {

    // for each internal api route, create an http request that will call it
    const clientApiCalls = routes.reduce((api, route) => {

        const clientCall = (peer, data) => {

            const inputType = route.method === 'GET'
                ? 'params'
                : 'data';

            return axios({
                method: route.method,
                url: `${utils.peerEndpoint(peer)}/${route.path}`,
                [inputType]: data,
                json: true
            })
            .then((response) => response.data);
        };

        // store the api call in the api hierarchy
        set(api, route.name, clientCall);

        return api;
    }, {});

    return clientApiCalls;
};

export default library;
