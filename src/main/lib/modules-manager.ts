import Module from '../modules/module';

export const init = async (...modules: Module[]) => {
  await Promise.all(
    modules.map(async module => { module.init(); })
  );
};
