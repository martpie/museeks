const init = (...modules) => {
  modules.forEach((module) => {
    module.init();
  });
};

module.exports = {
  init,
};
