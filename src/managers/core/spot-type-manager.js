'use strict'
// external deps
var ObjectId = require('mongodb').ObjectId;
var SpotModels = require('spot-models');
var SpotType = SpotModels.core.SpotType
var BaseManager = require('../base-manager');
require("mongodb-toolkit");

module.exports = class SpotTypeManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use('spot-types');
    }

    _validate(data) {
        var errors = {};
        return new Promise((resolve, reject) => { 
 
            if (!data.name || data.name == '')
                errors["name"] = "name is required";

            for (var prop in errors) {
                var ValidationError = require('../../validation-error');
                reject(new ValidationError('data does not pass validation', errors));
            }
            var valid = new SpotType(data);
            valid.stamp(this.user.username, 'manager');
            resolve(valid);
        });
    }

    _getQuery(_paging) {
        var deleted = {
            _deleted: false
        };
        var query = _paging.keyword ? {
            '$and': [deleted]
        } : deleted;

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
            var $or = {
                '$or': [filterCode, filterName]
            };

            query['$and'].push($or);
        }
        return query;
    }

}