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
        var deleted = {
            _deleted: false
        };
        var query = paging.keyword ? {
            "$and": [deleted]
        } : deleted;

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filterCode = {
                "code": {
                    "$regex": regex
                }
            };
            var filterName = {
                "name": {
                    "$regex": regex
                }
            };
            var $or = {
                "$or": [filterCode, filterName]
            };

            query["$and"].push($or);
        }
        return query;
    }

    _validate(role) {
        var errors = {};
        return new Promise((resolve, reject) => {
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
            Promise.all([getRolePromise])
                .then(results => {
                    var _role = results[0];

                    if (!valid.code || valid.code == "")
                        errors["code"] = "Kode harus diisi";
                    else if (_role) {
                        errors["code"] = "Kode sudah ada";
                    }

                    if (!valid.name || valid.name == "")
                        errors["name"] = "Nama Harus diisi";


                    // 2c. begin: check if data has any error, reject if it has.
                    if (Object.getOwnPropertyNames(errors).length > 0) { 
                        reject(new ValidationError("data does not pass validation", errors));
                    }

                    valid = new Role(valid);
                    valid.stamp(this.user.username, "manager");
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
}
