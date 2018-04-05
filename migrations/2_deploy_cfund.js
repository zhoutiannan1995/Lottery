var CFund = artifacts.require("CFund");
var Management = artifacts.require("Management");

module.exports = function(deployer) {
  deployer.deploy(CFund);
  deployer.link(CFund,Management);
  deployer.deploy(Management);
};
