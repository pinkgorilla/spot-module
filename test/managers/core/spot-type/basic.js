var dataUtil = require("../../../data/core/spot-type-data-util");
var options = {
    manager: require("../../../../src/managers/core/spot-type-manager"),
    model: require("spot-models").core.SpotType,
    validator: require("spot-models").validator.core.spotType,
    newDataCallback: dataUtil.getNewData
        // createDuplicate: true,
        // keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);
