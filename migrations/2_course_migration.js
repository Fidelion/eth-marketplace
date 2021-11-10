const CourseMigration = artifacts.require("CourseMarketplace");

module.exports = function (deployer) {
  deployer.deploy(CourseMigration);
};
