
const init = function(...modules) {
  modules.forEach((module) => {
    module.init();
  });
};

module.exports = {
  init,
};
