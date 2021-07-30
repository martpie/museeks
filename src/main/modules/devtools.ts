/**
 * Module in charge of loading devtools extensions to ensure a good developer
 * experience
 */

import installExtensions, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

import ModuleWindow from './module-window';

class DevtoolsModule extends ModuleWindow {
  async load(): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production';

    // Let's install some extensions so it's easier for us to debug things
    if (!isProduction) {
      const options = {
        loadExtensionOptions: { allowFileAccess: true },
      };

      try {
        await installExtensions([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], options);
        console.info(`[INFO] Added devtools extensions`);
      } catch (err) {
        console.info('[WARN] An error occurred while trying to add extensions:\n', err);
      }
    }
  }
}

export default DevtoolsModule;
