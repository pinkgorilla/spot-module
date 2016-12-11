"use strict"
require("mongodb-toolkit");

var ObjectId = require("mongodb").ObjectId;
var SpotModels = require("spot-models");
var map = SpotModels.map;
var Role = SpotModels.auth.Role;
var BaseManager = require("module-toolkit").BaseManager;
var ValidationError = require("module-toolkit").ValidationError;

module.exports = class RoleManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.auth.collection.Role);
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
            var codeFilter = {
                "code": {
                    "$regex": regex
                }
            };
            var nameFilter = {
                "name": {
                    "$regex": regex
                }
            };
            keywordFilter["$or"] = [codeFilter, nameFilter];
        }
        query["$and"] = [_default, keywordFilter, pagingFilter];
        return query;
    }

    _getNameErrors(role) {
        var errors = {};
        if (!role.name || role.name === "")
            errors["name"] = "name is required";
        return errors;
    }
    _getCodeErrors(role) {
        var errors = {};
        if (!role.code || role.code === "")
            errors["code"] = "code is required";
        return errors;
    }
    _validate(role) {
        var errors = {};
        // 1. begin: Declare promises.
        var getDuplicateRole = this.collection.singleOrDefault({
            "$and": [{
                _id: {
                    "$ne": new ObjectId(role._id)
                }
            }, {
                code: role.code
            }]
        });
        // 2. begin: Validation.
        return Promise.all([getDuplicateRole])
            .then(results => {
                var _duplicateRole = results[0];

                if (_duplicateRole) {
                    errors["code"] = "Code already exists";
                }
                else {
                    Object.assign(errors, this._getCodeErrors(role), this._getNameErrors(role))
                }

                // 2c. begin: check if data has any error, reject if it has.
                if (Object.getOwnPropertyNames(errors).length > 0) {
                    return Promise.reject(new ValidationError("data does not pass validation", errors));
                }

                var validRole = new Role(role);
                validRole.stamp(this.user.username, "manager");
                return Promise.resolve(validRole);
            });
    }
};
