const os = require('os');

let Integration = null;

if (os.platform() === 'win32') {
    Integration = require('./integrations/win32');
}

class IntegrationManager {
    constructor(win) {
        if(Integration !== null) {
            this.integration = new Integration(win);
        }
    }

    enable() {
        if(Integration === null) return;
        this.integration.enable();
    }

}

module.exports = IntegrationManager;
