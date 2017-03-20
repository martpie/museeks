const library = (lib) => {

    const save = () => (dispatch, getState) => ({
        type: 'APP_CONFIG_SAVE',
        payload: lib.config.save(getState().config)
    });

    const set = (key, value) => (dispatch) => {
      dispatch({
          type: 'APP_CONFIG_SET',
          payload: {
              key,
              value
          }
      });
      // We save in the next loop so the state has time to update
      setTimeout(() => dispatch(save()), 1);
    };

    const load = (config) => ({
        type: 'APP_CONFIG_LOAD',
        payload: lib.config.load()
    });

    return {
        set,
        save,
        load,
    }
}

export default library;
