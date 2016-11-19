'use strict'
// external deps
var ObjectId = require('mongodb').ObjectId;
var SpotModels = require('spot-models');
var Spot = SpotModels.core.Spot
var BaseManager = require('../base-manager');
require("mongodb-toolkit");

module.exports = class SpotManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use('spots');
    }

    _validate(data) {
        var errors = {};
        return new Promise((resolve, reject) => {

            if (!data.name || data.name == '')
                errors["name"] = "name is required";

            if (Object.getOwnPropertyNames(errors).length > 0) {
                var ValidationError = require('../../validation-error');
                reject(new ValidationError('data does not pass validation', errors));
            }

            var valid = new Spot(data);
            valid.stamp(this.user.username, 'manager');
            resolve(valid);
        });
    }

    _getQuery(_paging) {
        var basicFilter = {
                _deleted: false
            },
            keywordFilter = {};
        var query = {};

        if (_paging.keyword) {
            var regex = new RegExp(_paging.keyword, "i");
            var filterCode = {
                'code': {
                    '$regex': regex
                }
            };
            var filterName = {
                'name': {
                    '$regex': regex
                }
            };
            keywordFilter = {
                '$or': [filterCode, filterName]
            };

        }
        query = {
            '$and': [basicFilter, _paging.filter, keywordFilter]
        };
        return query;
    }
};
