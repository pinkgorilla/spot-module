function test(name, path) {
    describe(name, function() {
        require(path);
    });
}


describe("#bateeq-module", function(done) {
    this.timeout(2 * 6000);
    // test("@auth/account-manager", "./managers/auth/account-manager-test");
    // test("@auth/role-manager", "./managers/auth/role-manager-test");

    // test("@core/spot-type-manager", "./managers/core/spot-type-manager-test");
    // test("@core/spot-manager", "./managers/core/spot-manager-test");

    // test("@core/spot-manager", "./managers/core/spot");

    test("@CORE/SPOT-TYPE-MANAGER", "./managers/core/spot-type");
    test("@CORE/SPOT-MANAGER", "./managers/core/spot");
});
