function test(name, path) {
    describe(name, function() {
        require(path);
    })
}


describe('#bateeq-module', function(done) {
    this.timeout(2 * 6000); 
    test('@manager/spot-type-manager', './managers/spot-type-manager-test');
})