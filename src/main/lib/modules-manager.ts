import Module from '../modules/module';

export const init = (...modules: Module[]) => {
  modules.forEach((module) => {
    module.init();
  });
};
