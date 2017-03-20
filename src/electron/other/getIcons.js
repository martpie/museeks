import path from 'path';
import { nativeImage } from 'electron';

export default (appRoot) => {
  const logosPath = path.join(appRoot, 'src', 'images', 'logos');
  return {
      '256': nativeImage.createFromPath(path.join(logosPath, 'museeks.png')),
      '128': nativeImage.createFromPath(path.join(logosPath, 'museeks-128.png')),
      '64': nativeImage.createFromPath(path.join(logosPath, 'museeks-64.png')),
      '48': nativeImage.createFromPath(path.join(logosPath, 'museeks-48.png')),
      '32': nativeImage.createFromPath(path.join(logosPath, 'museeks-32.png')),
      'ico': nativeImage.createFromPath(path.join(logosPath, 'museeks.ico')),
      'tray': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.png')).resize({ width: 24, height: 24 }),
      'tray-ico': nativeImage.createFromPath(path.join(logosPath, 'museeks-tray.ico')).resize({ width: 24, height: 24 })
  };
}
