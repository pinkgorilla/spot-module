"use strict";
require("mongodb-toolkit");

var ObjectId = require("mongodb").ObjectId;
var SpotModels = require("spot-models");
var map = SpotModels.map;
var Account = SpotModels.auth.Account;

var BaseManager = require("module-toolkit").BaseManager;
var ValidationError = require("module-toolkit").ValidationError;
var sha1 = require("sha1");

module.exports = class AccountManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.auth.collection.Account);
    }

    _beforeInsert(data) {
        data.password = sha1(data.password);
        return Promise.resolve(data);
    }

    _beforeUpdate(data) {
        if (data.password && data.password.length > 0)
            data.password = sha1(data.password);
        else
            delete data.password;
        return Promise.resolve(data);
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
            var filterUsername = {
                "username": {
                    "$regex": regex
                }
            };
            var filterName = {
                "$or": [{
                    "profile.firstname": {
                        "$regex": regex
                    }
                }, {
                    "profile.lastname": {
                        "$regex": regex
                    }
                }]
            };
            var $or = {
                "$or": [filterUsername, filterName]
            };

            query["$and"].push($or);
        }
        return query;
    }

    _validate(account) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = account;
            // 1. begin: Declare promises.
            var getAccountPromise = valid.username ? this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        "$ne": new ObjectId(valid._id)
                    }
                }, {
                    username: {
                        "$regex": new RegExp((valid.username || "").trim(), "i")
                    }
                }]
            }) : Promise.resolve(null);
            // 2. begin: Validation.
            Promise.all([getAccountPromise])
                .then(results => {
                    var _module = results[0];

                    if (!valid.username || valid.username == "")
                        errors["username"] = "Username harus diisi";
                    else if (_module) {
                        errors["username"] = "Username sudah ada";
                    }

                    if (!valid._id && (!valid.password || valid.password == ""))
                        errors["password"] = "password is required";

                    if (!valid.profile)
                        errors["profile"] = "profile is required";
                    else {
                        var profileError = {};
                        if (!valid.profile.firstname || valid.profile.firstname == "")
                            profileError["firstname"] = "firstname harus diisi";

                        if (!valid.profile.gender || valid.profile.gender == "")
                            profileError["gender"] = "gender harus diisi";

                        if (Object.getOwnPropertyNames(profileError).length > 0)
                            errors["profile"] = profileError;
                    }


                    // 2c. begin: check if data has any error, reject if it has.
                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        reject(new ValidationError("data does not pass validation", errors));
                    }

                    valid = new Account(account);
                    valid.stamp(this.user.username, "manager");
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
};
