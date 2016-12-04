module.exports = {
    managers: {
        auth: {
            AccountManager: require("./src/managers/auth/account-manager"),
            RoleManager: require("./src/managers/auth/role-manager")
        },
        core: {
            SpotManager: require('./src/managers/core/spot-manager'),
            SpotTypeManager: require('./src/managers/core/spot-type-manager')
        }
    },
    test: {
        data: {
            auth: {
                account: require("./test/data/auth/account-data-util"),
                role: require("./test/data/auth/role-data-util")
            },
            core: {
                spot: require("./test/data/core/spot-data-util"),
                spotType: require("./test/data/core/spot-type-data-util")
            }
        }
    }
};
