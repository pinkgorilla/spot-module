module.exports = {
    auth: {
        AccountManager: require("./src/managers/auth/account-manager"),
        RoleManager: require("./src/managers/auth/role-manager")
    },
    core: {
        SpotManager: require('./src/managers/core/spot-manager'),
        SpotTypeManager: require('./src/managers/core/spot-type-manager')
    }
}