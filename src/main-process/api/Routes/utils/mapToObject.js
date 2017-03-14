const mapToObject = (arrayOfStrings, func) => {
    return arrayOfStrings.reduce((objectMap, currentValue) => {
      objectMap[currentValue] = func(currentValue);
      return objectMap;
    }, {});
};

module.exports = mapToObject;