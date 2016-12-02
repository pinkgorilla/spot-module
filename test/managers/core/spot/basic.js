var helper = require("../../../helper");
var Spot = require("../../../data/core/spot-data-util");
var SpotManager = require("../../../../src/managers/core/spot-manager");
var instanceManager = null;
var validate = require("spot-models").validator.core.spot;

var should = require("should");

before("#00. connect db", function(done) {
    helper.getDb()
        .then((db) => {
            instanceManager = new SpotManager(db, {
                username: "unit-test"
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01. should error when create new spot with empty data", function(done) {
    instanceManager.create({})
        .then((id) => {
            done("Should not be able to create data with empty data");
        })
        .catch((e) => {
            try {
                e.errors.should.have.property("name");
                done();
            }
            catch (ex) {
                done(e);
            }
        });
});

var createdId;
it("#02. should success when create new data", function(done) {
    Spot.getNewData()
        .then((data) => instanceManager.create(data))
        .then((id) => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch((e) => {
            done(e);
        });
});

var createdData;
it(`#03. should success when get created data with id`, function(done) {
    instanceManager.getSingleById(createdId)
        .then((data) => {
            data.should.instanceof(Object);
            validate(data);
            createdData = data;
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it(`#04. should success when update created data`, function(done) {

    createdData.name += "[updated]";
    instanceManager.update(createdData)
        .then((id) => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it(`#05. should success when get updated data with id`, function(done) {
    instanceManager.getSingleById(createdId)
        .then((data) => {
            validate(data);
            data.name.should.equal(createdData.name);
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it("#06. should success when read data", function(done) {
    instanceManager.read({
            filter: {
                _id: createdId
            }
        })
        .then((documents) => {
            //process documents
            documents.should.have.property("data");
            documents.data.should.be.instanceof(Array);
            documents.data.length.should.not.equal(0);
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it(`#07. should success when delete data`, function(done) {
    instanceManager.delete(createdData)
        .then((id) => {
            id.toString().should.equal(createdId.toString());
            done();
        })
        .catch((e) => {
            done(e);
        });
});


it(`#08. should _deleted=true`, function(done) {
    instanceManager.getSingleByQuery({
            _id: createdId
        })
        .then((data) => {
            validate(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it("#09. should success when destroy data with id", function(done) {
    instanceManager.destroy(createdId)
        .then((result) => {
            result.should.be.Boolean();
            result.should.equal(true);
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it(`#10. should null when get destroyed data`, function(done) {
    instanceManager.getSingleByIdOrDefault(createdId)
        .then((data) => {
            should.equal(data, null);
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it(`#11. should success when get test data`, function(done) {
    Spot.getTestData()
        .then((data) => {
            data.should.not.equal(null);
            done();
        })
        .catch((e) => {
            done(e);
        });
});
