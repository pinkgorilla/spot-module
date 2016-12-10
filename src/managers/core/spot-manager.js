"use strict";
// external deps
var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");

var SpotModels = require("spot-models");
var map = SpotModels.map;
var Spot = SpotModels.core.Spot;
var BaseManager = require("module-toolkit").BaseManager;
var SpotTypeManager = require("./spot-type-manager");
var ValidationError = require("module-toolkit").ValidationError;

module.exports = class SpotManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use("spots");
        this.spotTypeManager = new SpotTypeManager(db, user);
    }

    _validate(data) {
        var errors = {};
        var spotTypeId = ObjectId.isValid(data.spotTypeId) ? new ObjectId(data.spotTypeId) : new ObjectId();
        var getSpotType = this.spotTypeManager.getSingleByIdOrDefault(spotTypeId);

        return Promise.all([getSpotType])
            .then((results) => {
                var spotType = results[0];

                if (!data.name || data.name == "") {
                    errors["name"] = "name is required";
                }

                if (!spotType) {
                    errors["spotTypeId"] = errors["spotType"] = "spotType is not valid";
                }

                if (Object.getOwnPropertyNames(errors).length > 0) {
                    return Promise.reject(new ValidationError("data does not pass validation", errors));
                }

                data.spotTypeId = spotType._id;
                data.spotType = spotType;

                var valid = new Spot(data);
                valid.stamp(this.user.username, "manager");
                return Promise.resolve(valid);
            });
    }

    _getQuery(paging) {
        var _default = {
                _deleted: false
            },
            pagingFilter = paging.filter || {},
            keywordFilter = {},
            query = {};

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var nameFilter = {
                "name": {
                    "$regex": regex
                }
            };
            keywordFilter["$or"] = [nameFilter];
        }
        query["$and"] = [_default, keywordFilter, pagingFilter];
        return query;
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.core.collection.Spot}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        };

        var nameRateIndex = {
            name: `ix_${map.core.collection.Spot}_name`,
            key: {
                name: 1,
                rate: 1
            },
            unique: true
        };

        return this.collection.createIndexes([dateIndex, nameRateIndex]);
    }
};
