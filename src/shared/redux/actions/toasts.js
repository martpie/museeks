const library = (lib) => {

    const add = (type, content, duration = 3000) => {
        const _id = Date.now();
        const toast = { _id, type, content };

        return (dispatch) => {
            dispatch({
                type   : 'TOAST/ADD',
                toast
            });
            setTimeout(() => {
                dispatch({
                    type: 'TOAST/REMOVE',
                    _id
                });
            }, duration);
        };
    };

    return {
        add
    };
};

export default library;
