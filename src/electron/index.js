process.env.NODE_ENV = 'production'; // Drastically increase performances
require('babel-register');
require('./main');
