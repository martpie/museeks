import logger from '../../shared/lib/logger';
import Module from '../modules/module';

export const init = async (...modules: Module[]): Promise<void> => {
  await Promise.all(
    modules.map((module) =>
      module.init().catch((err) => {
        throw err;
      })
    )
  ).catch((err) => {
    logger.error(`An error occured when loading ${module.constructor.name} could not be loaded:\n${err}`);
  });
};
