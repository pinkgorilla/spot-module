var dataUtil = require("../../../data/auth/role-data-util");
var options = {
    manager: require("../../../../src/managers/auth/role-manager"),
    model: require("spot-models").auth.Role,
    validator: require("spot-models").validator.auth.role,
    newDataCallback: dataUtil.getNewData,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);
