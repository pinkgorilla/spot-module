var dataUtil = require("../../../data/core/spot-data-util");
var options = {
    manager: require("../../../../src/managers/core/spot-manager"),
    model: require("spot-models").core.Spot,
    validator: require("spot-models").validator.core.spot,
    newDataCallback: dataUtil.getNewData
        // createDuplicate: false,
        // keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);
