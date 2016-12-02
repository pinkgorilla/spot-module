"use strict"
// external deps
var ObjectId = require("mongodb").ObjectId;
var SpotModels = require("spot-models");
var SpotType = SpotModels.core.SpotType;
var BaseManager = require("module-toolkit").BaseManager;
var ValidationError = require("module-toolkit").ValidationError;
require("mongodb-toolkit");

module.exports = class SpotTypeManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use("spot-types");
    }

    _validate(data) {
        var errors = {};

        if (!data.name || data.name == "") {
            errors["name"] = "name is required";
        }
        
        if (Object.getOwnPropertyNames(errors).length > 0) {
            return Promise.reject(new ValidationError("data does not pass validation", errors));
        }
        var valid = new SpotType(data);
        valid.stamp(this.user.username, "manager");
        return Promise.resolve(valid);
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
};
