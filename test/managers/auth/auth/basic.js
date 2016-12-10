var helper = require("../../../helper");
var Account = require("../../../data/auth/account-data-util");
var AuthManager = require("../../../../src/managers/auth/auth-manager");
var instanceManager = null;
var validate = require("spot-models").validator.auth.account;

var should = require("should");

before("#00. connect db", function(done) {
    helper.getDb()
        .then((db) => {
            instanceManager = new AuthManager(db, {
                username: "unit-test"
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01. should success when authenticate", function(done) {
    Account.getTestData()
        .then((account) => {
            instanceManager.authenticate(account.username, "Standar123")
                .then((acc) => {
                    acc.should.not.have.property("password");
                    done();
                })
                .catch((ex) => {
                    done(ex);
                });
        })
        .catch((ex) => {
            done(ex);
        });
});
