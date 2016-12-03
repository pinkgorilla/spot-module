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

    authenticate(username, password) {
        if (username === "")
            return Promise.resolve(null);
        var query = {
            username: username,
            password: sha1(password),
            _deleted: false
        };
        return this.getSingleByQuery(query)
            .then(account => {
                delete account.password;
                return Promise.resolve(account);
            });
    }
};
