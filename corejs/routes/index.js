const {corsWithOptions, cors} = require('./lib/cors.config');
const {AuthRoutes} = require('./lib/auth.routes.config');
const {DefaultRoutesConfig} = require('./lib/default.routes.config');
const {initCustomRoutes} = require('./lib/init.routes.config');
const {UsersRoutes} = require('./lib/users.routes.config');

module.exports ={ corsWithOptions,cors,DefaultRoutesConfig, UsersRoutes,AuthRoutes, initCustomRoutes }