/**
 * i18next instance
 */

import { ipcRenderer } from 'electron';
import i18next, { BackendModule } from 'i18next';
import { initReactI18next, useTranslation as useI18nextTranslation, UseTranslationResponse } from 'react-i18next';
import BackendAdapter from 'i18next-multiload-backend-adapter';
import LanguageDetector from 'i18next-electron-language-detector';

import { DEFAULT_LANGUAGE, LANGUAGES, NAMESPACES } from '../../shared/lib/languages';
import channels from '../../shared/lib/ipc-channels';

const ipcBackend: BackendModule = {
  type: 'backend',
  init: function (_services, _backendOptions, _i18nextOptions) {
    /* use services and options */
  },
  read: function (_language, _namespace, callback) {
    callback(
      new Error(
        'i18next ipcBackend should not be using `read`, is i18next-multiload-backend-adapter correctly configured'
      ),
      null
    );
  },
  readMulti: function (languages, namespaces, callback) {
    console.info('request MULTI', languages, namespaces);

    ipcRenderer
      .invoke(channels.I18N_GET_RESOURCES)
      .then((resources: Record<string, Record<string, string>>) => {
        console.log('RECEIVED: ', resources);
        callback(null, resources);
      })
      .catch((err) => {
        console.log('NOTRECEIVED');
        callback(err, null);
      });
  },
};

const i18n = i18next
  .createInstance({
    backend: {
      backend: ipcBackend,
    },

    // lng: 'en', // use detector instead
    supportedLngs: LANGUAGES,
    fallbackLng: DEFAULT_LANGUAGE,
    ns: NAMESPACES,
    defaultNS: '',

    debug: process.env.NODE_ENV === 'development',
  })
  .use(LanguageDetector)
  .use(BackendAdapter)
  .use(initReactI18next);

export default i18n;

/**
 * Custom useTranslation hook to avoid suspense
 */
export const useTranslation = (): UseTranslationResponse<''> => useI18nextTranslation('', { useSuspense: false });
