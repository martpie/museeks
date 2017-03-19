import { Application } from 'spectron';
import path from 'path';

const electronPath = path.join(__dirname, '../..', 'node_modules', '.bin', 'electron');

const platformPath = process.platform === 'win32'
    ? electronPath + '.cmd'
    : electronPath;

const appPath = path.join(__dirname, '../..');

const app = new Application({
    path: platformPath,
    args: [appPath]
});

app.start().catch((err) => {});

const runTests = () => {
    console.log('running')
}

setTimeout(runTests, 5000);
