import { ConfigController } from '../../controllers/index.js';
import { DefaultRoutesConfig } from './default.routes.config.js';
export async function ConfigRoutes() {
    return new DefaultRoutesConfig(new ConfigController(), async function () {
        await this.buidRoute(this.routeName + '/routes', 'list', 'routes', ['isAuthenticated', 'isAdmin']);
        await this.defaultRoutes();
    });
}
