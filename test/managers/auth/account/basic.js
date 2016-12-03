var helper = require("../../../helper");
var Account = require("../../../data/auth/account-data-util");
var AccountManager = require("../../../../src/managers/auth/account-manager");
var instanceManager = null;
var validate = require("spot-models").validator.auth.account;

var should = require("should");

before("#00. connect db", function(done) {
    helper.getDb()
        .then((db) => {
            instanceManager = new AccountManager(db, {
                username: "unit-test"
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01B. should error when create new account with empty data", function(done) {
    instanceManager.create({})
        .then((id) => {
            done("Should not be able to create data with empty data");
        })
        .catch((e) => {
            try {
                e.errors.should.have.property("username");
                e.errors.should.have.property("password");
                e.errors.should.have.property("profile");
                done();
            }
            catch (ex) {
                done(e);
            }
        });
});

it("#01B. should error with property username, password, profile.firstname and profile.gender ", function(done) {
    instanceManager.create({
            profile: {}
        })
        .then(id => {
            done("Should error with property username, password and profile");
        })
        .catch(e => {
            try {
                e.errors.should.have.property("username");
                e.errors.should.have.property("password");
                e.errors.should.have.property("profile");
                e.errors.profile.should.have.property("firstname");
                e.errors.profile.should.have.property("gender");
                done();
            }
            catch (ex) {
                done(ex);
            }
        })
});

var createdId;
it("#02. should success when create new data", function(done) {
    Account.getNewData()
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

it("#04. should error when create new data with same code", function(done) {
    var data = Object.assign({}, createdData);
    delete data._id;

    instanceManager.create(data)
        .then((id) => {
            done("Should not be able to create data with same username");
        })
        .catch((e) => {
            try {
                e.errors.should.have.property("username");
                done();
            }
            catch (ex) {
                done(e);
            }
        });
});

it(`#05. should success when update created data`, function(done) {

    createdData.profile.lastname += "[updated]";
    instanceManager.update(createdData)
        .then((id) => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it(`#06. should success when get updated data with id`, function(done) {
    instanceManager.getSingleById(createdId)
        .then((data) => {
            validate(data);
            data.profile.lastname.should.equal(createdData.profile.lastname);
            done();
        })
        .catch((e) => {
            done(e);
        });
});

it("#07. should error when update new data with same unit", function(done) {
    var newDataId;
    Account.getNewData()
        .then((data) => instanceManager.create(data))
        .then((newId) => instanceManager.getSingleById(newId))
        .then((newData) => {
            newDataId = newData._id;
            newData.username = createdData.username;
            return instanceManager.update(newData);
        })
        .then((id) => {
            done("Should not be able to update data with same username");
        })
        .catch((e) => {
            try {
                e.errors.should.have.property("username");
                instanceManager.destroy(newDataId)
                    .then(() => done());
            }
            catch (ex) {
                done(e);
            }
        });
});

it("#08. should success when read data", function(done) {
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

it(`#09. should success when delete data`, function(done) {
    instanceManager.delete(createdData)
        .then((id) => {
            id.toString().should.equal(createdId.toString());
            done();
        })
        .catch((e) => {
            done(e);
        });
});


it(`#10. should _deleted=true`, function(done) {
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

it("#11. should success when destroy data with id", function(done) {
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

it(`#12. should null when get destroyed data`, function(done) {
    instanceManager.getSingleByIdOrDefault(createdId)
        .then((data) => {
            should.equal(data, null);
            done();
        })
        .catch((e) => {
            done(e);
        });
});
