/**
 * Module in charge of loading devtools extensions to ensure a good developer
 * experience
 */

import installExtensions, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-assembler';

import logger from '../../shared/lib/logger';

import ModuleWindow from './BaseWindowModule';

export default class DevtoolsModule extends ModuleWindow {
  async load(): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production';

    // Let's install some extensions so it's easier for us to debug things
    if (!isProduction) {
      try {
        await installExtensions([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], {
          loadExtensionOptions: {
            allowFileAccess: true,
          },
        });
        logger.info('Added devtools extensions');
      } catch (err) {
        logger.warn('An error occurred while trying to add extensions:\n', err);
      }
    }
  }
}
