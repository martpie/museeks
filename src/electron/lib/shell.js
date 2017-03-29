import { shell } from 'electron';

// More functions available: https://github.com/electron/electron/blob/master/docs/api/shell.md
export default {
    showItemInFolder: shell.showItemInFolder,
    openExternal: shell.openExternal
};
