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
    _getUsernameErrors(account) {
        var errors = {};
        if (!account.username || account.username === "")
            errors["username"] = "username is required";
        return errors;
    }
    _getPasswordErrors(account) {
        var errors = {};
        if (!account._id && (!account.password || account.password === ""))
            errors["password"] = "password is required";
        return errors;
    }
    _getProfileErrors(account) {
        var errors = {};
        var profileErrors = {};
        if (!account.profile.firstname || account.profile.firstname === "")
            profileErrors["firstname"] = "firstname harus diisi";

        if (!account.profile.gender || account.profile.gender === "")
            profileErrors["gender"] = "gender harus diisi";

        if (Object.getOwnPropertyNames(profileErrors).length > 0)
            errors["profile"] = profileErrors;

        return errors;
    }
    _validate(account) {
        var errors = {};
        var valid = account;
        // 1. begin: Declare promises.
        var getOtherAccount = valid.username ? this.collection.singleOrDefault({
            "$and": [{
                _id: {
                    "$ne": new ObjectId(account._id)
                }
            }, {
                username: {
                    "$regex": new RegExp((account.username || "").trim(), "i")
                }
            }]
        }) : Promise.resolve(null);
        // 2. begin: Validation.
        return Promise.all([getOtherAccount])
            .then(results => {
                var _otherAccount = results[0];

                if (_otherAccount) {
                    errors["username"] = "Username sudah ada";
                }
                else
                    Object.assign(errors, this._getUsernameErrors(account));

                if (!account.profile)
                    errors["profile"] = "profile is required";
                else
                    Object.assign(errors, this._getProfileErrors(account));

                Object.assign(errors, this._getPasswordErrors(account));

                // 2c. begin: check if data has any error, reject if it has.
                if (Object.getOwnPropertyNames(errors).length > 0) {
                    return Promise.reject(new ValidationError("data does not pass validation", errors));
                }

                valid = new Account(account);
                valid.stamp(this.user.username, "manager");
                return Promise.resolve(valid);
            });
    }
};
