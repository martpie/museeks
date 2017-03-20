import { Application } from 'spectron';
import path from 'path';

const commonPath = path.join(__dirname, '../../..', 'node_modules', '.bin', 'electron');
const platformPath = process.platform === 'win32' ? '.cmd' : '';
const electronPath = commonPath + platformPath;

const appPath = path.join(__dirname, '../../..');

// chromedriver default port
let port = 9159;

const Electron = (config) => new Application({
    path: electronPath,
    args: [appPath],
    port: port++,
    env: {
        SPECTRON: true,
        config: JSON.stringify(config.env.config)
    }
});

export default Electron;
