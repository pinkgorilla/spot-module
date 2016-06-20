'use strict'
// external deps
var ObjectId = require('mongodb').ObjectId;
var Manager = require('mean-toolkit').Manager;
var SpotModels = require('spot-models');

module.exports = class SpotTypeManager extends Manager {
    constructor(db, user) {
        super(db);
        this.user = user;

        this.spotTypeCollection = this.db.use('spot-types');
    } 
}