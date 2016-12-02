"use strict";
var _getSert = require("../getsert");
var ObjectId = require("mongodb").ObjectId;
var SpotType = require("./spot-type-data-util");
var generateCode = require("../../../src/utils/code-generator");

class SpotDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/core/spot-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                _id: data._id
            };
        });
    }

    getNewData() {
        return SpotType.getTestData()
            .then((spotType) => {

                var Model = require("spot-models").core.Spot;
                var data = new Model();

                var code = generateCode();

                data.name = `name[${code}]`;
                data.description = `Spot data for unit testing.`;
                data.spotTypeId = spotType._id;
                data.spotType = spotType;

                return Promise.resolve(data);
            });
    }

    getTestData() {
        return this.getNewData()
            .then((data) => {
                data._id = new ObjectId("5841a53b427efb9530942a71");
                data.name = "Unit Test Spot";
                data.description = "Spot data for unit testing.";
                return this.getSert(data);
            });
    }
}
module.exports = new SpotDataUtil();
