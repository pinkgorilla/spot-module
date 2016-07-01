'use strict'
// external deps
var ObjectId = require('mongodb').ObjectId; 
var SpotModels = require('spot-models');
var SpotType = SpotModels.SpotType
require("mongodb-toolkit");

module.exports = class SpotTypeManager{
    constructor(db, user) {
        this.db = db;
        this.user = user;

        this.spotTypeCollection = this.db.use('spot-types');
    } 

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);
        
        return new Promise((resolve, reject) => {
            this.spotTypeCollection
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(spotTypes => {
                    resolve(spotTypes);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            var query = {
                _id: new ObjectId(id)
            };
            this.getSingleByQuery(query)
                .then(spotType => {
                    resolve(spotType);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.spotTypeCollection
                .single(query)
                .then(spotType => {
                    resolve(spotType);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(spotType) {
        return new Promise((resolve, reject) => {
            this._validate(spotType)
                .then(validSpotType => {

                    this.spotTypeCollection.insert(validSpotType)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(spotType) {
        return new Promise((resolve, reject) => {
            this._validate(spotType)
                .then(validSpotType => {
                    this.spotTypeCollection.update(validSpotType)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    delete(spotType) {
        return new Promise((resolve, reject) => {
            this._validate(spotType)
                .then(validSpotType => {
                    validSpotType._deleted = true;
                    this.spotTypeCollection.update(validSpotType)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }


    _validate(spotType) {
        return new Promise((resolve, reject) => {
            var valid = new SpotType(spotType);
            valid.stamp(this.user.username, 'manager');
            resolve(valid);
        });
    }
}