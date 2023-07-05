import SettingsAPI from './SettingsAPI';

const init = async (): Promise<void> => {
  await SettingsAPI.check();

  // Tell the main process to show the window
  window.MuseeksAPI.app.ready();
};

// Should we use something else to harmonize between zustand and non-store APIs?
const AppAPI = {
  init,
};

export default AppAPI;
