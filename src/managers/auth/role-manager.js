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

    _validate(role) {
        var errors = {};
        var valid = role;
        // 1. begin: Declare promises.
        var getRolePromise = this.collection.singleOrDefault({
            "$and": [{
                _id: {
                    "$ne": new ObjectId(valid._id)
                }
            }, {
                code: valid.code
            }]
        });
        // 2. begin: Validation.
        return Promise.all([getRolePromise])
            .then(results => {
                var _role = results[0];

                if (!valid.code || valid.code == "")
                    errors["code"] = "Code is required";
                else if (_role) {
                    errors["code"] = "Code already exists";
                }

                if (!valid.name || valid.name == "")
                    errors["name"] = "Nama Harus diisi";


                // 2c. begin: check if data has any error, reject if it has.
                if (Object.getOwnPropertyNames(errors).length > 0) {
                    return Promise.reject(new ValidationError("data does not pass validation", errors));
                }

                valid = new Role(valid);
                valid.stamp(this.user.username, "manager");
                return Promise.resolve(valid);
            });
    }
};
