var dataUtil = require("../../../data/auth/account-data-util");
var options = {
    manager: require("../../../../src/managers/auth/account-manager"),
    model: require("spot-models").auth.Account,
    validator: require("spot-models").validator.auth.account,
    newDataCallback: dataUtil.getNewData,
    createDuplicate: true,
    keys: ["username"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);
