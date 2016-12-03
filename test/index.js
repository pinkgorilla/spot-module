function test(name, path) {
    describe(name, function() {
        require(path);
    });
}


describe("#bateeq-module", function(done) {
    this.timeout(2 * 6000);
    
    test("@AUTH/ACCOUNT-MANAGER", "./managers/auth/account");
    test("@AUTH/ROLE-MANAGER", "./managers/auth/role"); 

    test("@CORE/SPOT-TYPE-MANAGER", "./managers/core/spot-type");
    test("@CORE/SPOT-MANAGER", "./managers/core/spot");
});
