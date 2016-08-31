require('should');
var ObjectId = require('mongodb').ObjectId;
var helper = require('../helper');
var validate = require('spot-models').validate;
var manager;

function getData() {
    var SpotType = require('spot-models').SpotType;
    var spotType = new SpotType();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);
    spotType.code = code;
    spotType.name = `name[${code}]`;
    spotType.description = `description for ${code}`;
    spotType.icon = `icon[${code}]`;

    return spotType;
}

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            var SpotTypeManager = require('../../src/managers/spot-type-manager');
            manager = new SpotTypeManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#01. should success when create new data', function(done) {
    var data = getData();
    manager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdData;
it(`#02. should success when get created data with id`, function(done) {
    manager.getSingleById(createdId)
        .then(data => {
            validate.spotType(data);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. should success when update created data`, function(done) {

    createdData.name += '[updated]';
    createdData.description += '[updated]';

    manager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#04. should success when get updated data with id`, function(done) {
    manager.getSingleById(createdId)
        .then(data => {
            validate.spotType(data);
            data.name.should.equal(createdData.name);
            data.description.should.equal(createdData.description);
            data.icon.should.equal(createdData.icon);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#05. should success when delete data`, function(done) {
    manager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should _deleted=true`, function(done) {
    manager.getSingleByQuery({
            _id: new ObjectId(createdId)
        })
        .then(data => {
            validate.spotType(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#07. should error with property name ', function(done) {
    manager.create({})
        .then(id => {
            done("Should not be error with property name");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('name');
                done();
            }
            catch (ex) {
                done(ex);
            }
        })
});