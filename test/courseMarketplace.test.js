const { catchRevert } = require("./utils/exceptions");

const CourseMarketplace = artifacts.require("CourseMarketplace");

contract("CourseMarketplace", accounts => {

    const courseId = "0x00000000000000000000000000003130";
    const proof = "0x0000000000000000000000000000313000000000000000000000000000003130"
    const value = "9000000000";

    let _contract = null;
    let contractOwner = null;
    let buyer = null;
    let courseHash;

    before(async() => {
        _contract = await CourseMarketplace.deployed();
        contractOwner = accounts[0];
        buyer = accounts[1];
    })

    describe("Purchase the new course", () => {
        before(async() => {
            await _contract.purchaseCourse(courseId, proof, {
                from: buyer,
                value
            })
        })

        it("should not allow to purchase already owned course", async() => {
           await catchRevert(_contract.purchaseCourse(courseId, proof, {
               from: buyer,
               value
           }));
        })

        it("can get the purchased course hash by index", async() => {
            const index = 0;
            courseHash = await _contract.getCourseAtIndex(index);
            const expectedHash = web3.utils.soliditySha3(
                { type: "bytes16", value: courseId },
                { type: "address", value: buyer }
            );

            assert.equal(courseHash, expectedHash, "Course hash is not matching the expcted hash");
        })

        it("should match the data of the course purchased by buyer", async() => {
            const expectedIndex = 0;
            const expectedState = 0;
            const course = await _contract.getCourseAtHash(courseHash);

            assert.equal(course.id, expectedIndex, "Course index should be 0!");
            assert.equal(course.price, value, `Course price should be ${value}`);
            assert.equal(course.proof, proof, `Course proof should be ${proof}!`);
            assert.equal(course.owner, buyer, `Course buyer should be ${buyer}`);
            assert.equal(course.state, expectedState, `Course index should be ${expectedState}!`);
        })
    })

    describe("Activate the course", () => {
        it("should not be activated if use is not the contract owner", async() => {
           await catchRevert(_contract.activateCourse(courseHash, { from: buyer }));
        })

        it("should have status of activated", async() => {
            await _contract.activateCourse(courseHash, {from: contractOwner});
            const course = await _contract.getCourseAtHash(courseHash);
            const expectedState = 1;

            assert.equal(course.state, expectedState, "Course state should be activated");
        })
    })

    describe("Transfer Ownership", () => {
        let currentOwner = null;

        before(async() => {
            currentOwner = await _contract.getContractOwner();
        })

        it("getContractOwner should return deployers address", async() => {
            assert.equal(
                contractOwner,
                currentOwner,
                "Current owner and contract owner do not match"
            )
        })

        it("should not transfer ownership if the contractOwner is not sending transaction", async() => {
            await catchRevert(_contract.transferOwnership(accounts[4], { from: accounts[3] }));
        })

        it("should transfer contract ownership to 3rd account from owner of the contract", async() => {
            await _contract.transferOwnership(accounts[2], { from: currentOwner });
            const owner = await _contract.getContractOwner();
            assert.equal(owner, accounts[2], "Contract owner has not been successfully switched");
        })

        it("should transfer ownership to its original contract owner", async() => {
            await _contract.transferOwnership(contractOwner, { from: accounts[2] });
            const owner = await _contract.getContractOwner();
            assert.equal(owner, contractOwner, "Contract owner has not been successfully set to its original contract owner");
        })
    })
})