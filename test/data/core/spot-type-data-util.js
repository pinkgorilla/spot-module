"use strict";
var _getSert = require("../getsert");
var ObjectId = require("mongodb").ObjectId;
var generateCode = require("../../../src/utils/code-generator");

class SpotDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/core/spot-type-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                _id: data._id
            };
        });
    }

    getNewData() {
        var Model = require("spot-models").core.SpotType;
        var data = new Model();

        var code = generateCode();

        data.name = `SPOT-TYPE[${code}]`;
        data.description = `Spot type data for unit testing.`;
        data.icon = `icon-[${code}]`;

        return Promise.resolve(data);
    }

    getTestData() {
        var data = {
            _id: new ObjectId("5841a53b427efb9530942a70"),
            name: "Test Type",
            description: "Unit test spot type",
            icon: "test-icon",
        };
        return this.getSert(data);
    }
}
module.exports = new SpotDataUtil();
