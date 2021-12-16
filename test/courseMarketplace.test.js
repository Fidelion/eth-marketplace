const { catchRevert } = require("./utils/exceptions");
const CourseMarketplace = artifacts.require("CourseMarketplace");

const getBalance = async (address) => web3.eth.getBalance(address);

const toBN = value => web3.utils.toBN(value);

const getGas = async result => {
    const tx = await web3.eth.getTransaction(result.tx);
    const gasUsed = toBN(result.receipt.gasUsed);
    const gasPrice = toBN(tx.gasPrice);
    const gas = gasUsed.mul(gasPrice);
    return gas;
}

contract("CourseMarketplace", accounts => {

    const courseId = "0x00000000000000000000000000003130";
    const proof = "0x0000000000000000000000000000313000000000000000000000000000003130";

    const courseId2 = "0x00000000000000000000000000002130";
    const proof2 = "0x0000000000000000000000000000213000000000000000000000000000002130";


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

    describe("Deactivate Course Feature", () => {
        let courseHash2 = null;
        let currentOwner = null;

        before(async() => {
            await _contract.purchaseCourse(courseId2, proof2, {from: buyer, value});
            courseHash2 = await _contract.getCourseAtIndex(1);
            currentOwner = await _contract.getContractOwner();
        })

        it("should NOT be able to deactivate the course if the user is not contract owner", async() => {
            await catchRevert(_contract.deactivateCourse(courseHash2, {from:buyer}));
        })

        it("should have status of deactivated and price 0", async() => {
            const beforeTxOwnerBalance = await getBalance(currentOwner);
            const beforeTxBuyerBalance = await getBalance(buyer);
            const beforeTxContractBalance = await getBalance(_contract.address);
            
            const result = await _contract.deactivateCourse(courseHash2, {from: contractOwner});
            
            const afterTxOwnerBalance = await getBalance(currentOwner);
            const afterTxBuyerBalance = await getBalance(buyer);
            const afterTxContractBalance = await getBalance(_contract.address);
            
            const course = await _contract.getCourseAtHash(courseHash2);
            const expectedState = 2;
            const expectedPrice = 0;
            const gas = await getGas(result);

            assert.equal(course.state, expectedState, "Course is NOT deactivated");
            assert.equal(course.price, expectedPrice, "Course price should be 0 upon deactivating");

            assert.equal(
                toBN(beforeTxOwnerBalance).sub(gas).toString(), 
                afterTxOwnerBalance, 
                "Contract owner balance is not correct"
                );

            assert.equal(
                toBN(beforeTxContractBalance).sub(toBN(value)).toString(), 
                afterTxContractBalance, 
                "Contract balance is not correct"
                );
            
            assert.equal(
                toBN(beforeTxBuyerBalance).add(toBN(value)).toString(), 
                afterTxBuyerBalance, 
                "Contract balance is not correct"
                );

        })

        it("should NOT be able to activate course after deactivating it, course should be repurchased first", async() => {
            await catchRevert(_contract.activateCourse(courseHash2, {from: contractOwner}));
        })
    })

    describe("Repurchase course", () => {
        let courseHash2 = null

        before(async () => {
        courseHash2 = await _contract.getCourseAtIndex(1)
        })

        it("should NOT repurchase when the course doesn't exist", async () => {
        const notExistingHash = "0x5ceb3f8075c3dbb5d490c8d1e6c950302ed065e1a9031750ad2c6513069e3fc3"
        await catchRevert(_contract.repurchaseCourse(notExistingHash, {from: buyer}))
        })

        it("should NOT repurchase with NOT course owner", async () => {
        const notOwnerAddress = accounts[2]
        await catchRevert(_contract.repurchaseCourse(courseHash2, {from: notOwnerAddress}))
        })

        it("should be able repurchase with the original buyer", async () => {
        const beforeTxBuyerBalance = await getBalance(buyer);
        const beforeTxContractBalance = await getBalance(_contract.address);
        const result = await _contract.repurchaseCourse(courseHash2, {from: buyer, value});
        const afterTxBuyerBalance = await getBalance(buyer);
        const afterTxContractBalance = await getBalance(_contract.address);

        const gas = await getGas(result);
       
        const course = await _contract.getCourseAtHash(courseHash2);
       
        const exptectedState = 0

        assert.equal(course.state, exptectedState, "The course is not in purchased state")
        assert.equal(course.price, value, `The course price is not equal to ${value}`)


        assert.equal(
            toBN(beforeTxBuyerBalance).sub(toBN(value)).sub(gas).toString(), 
            afterTxBuyerBalance, 
            "Client balance is not correct.");

        assert.equal(
            toBN(beforeTxContractBalance).add(toBN(value)).toString(), 
            afterTxContractBalance, 
            "Client balance is not correct.");

        })

        it("should NOT be able to repurchase purchased course", async () => {
        await catchRevert(_contract.repurchaseCourse(courseHash2, {from: buyer}))
        })
    })

    describe("Receive funds", () => {

        it("should be able to receive funds", async() => {
            const value = "100000000000000000";
            const contractBeforeTx = await getBalance(_contract.address);

            await web3.eth.sendTransaction({
                from: buyer,
                to: _contract.address,
                value
            })

            const contractAfterTx = await getBalance(_contract.address);

            assert.equal(
                toBN(contractBeforeTx).add(toBN(value)).toString(),
                contractAfterTx,
                "Balance after transaction is not matching."
            );
            
        })
    })


    describe("Normal Withdraw", () => {
        const fundsToDeposit = "100000000000000000";
        const overLimitFunds = "999999000000000000000";

        let currentOwner = null;

        before(async() => {
            currentOwner = await _contract.getContractOwner();

            await web3.eth.sendTransaction({
                from: buyer,
                to: _contract.address,
                value: fundsToDeposit
            });
        })

        it("should fail when withdrawing with buyers address", async() => {
            const value = "10000000000000000";
            await catchRevert(_contract.withdraw(value, {from: buyer}));
        })

        it("should fail with over the limit balance", async() => {
            await catchRevert(_contract.withdraw(overLimitFunds, {from: currentOwner}));
        })

        it("should have +0.1ETH after withdrawal", async() => {
            const ownerBalance = await getBalance(currentOwner);
            const result = await _contract.withdraw(fundsToDeposit, {from: currentOwner});
            const newOwnerBalance = await getBalance(currentOwner);
            const gas = await getGas(result);

            assert.equal(
                toBN(ownerBalance).add(toBN(fundsToDeposit)).sub(gas).toString(),
                newOwnerBalance,
                "The owner balance is incorrect"
            );
        })
    })

    describe("Emergency withdrawal", async() => {
        let currentOwner;

        before(async() => {
            currentOwner = await _contract.getContractOwner();
        })

        after(async() => {
            await _contract.resumeContract({from: currentOwner});
        })

        it("should fail when contract is NOT stopped", async() => {
            await catchRevert(_contract.emergencyWithdraw({from: currentOwner}));
        })

        it("should have +contract funds on contract owner", async() => {
            await _contract.stopContract({from: contractOwner});

            const contractBalance = await getBalance(_contract.address);
            const ownerBalance = await getBalance(currentOwner);

            const result = await _contract.emergencyWithdraw({from: currentOwner});
            const gas = await getGas(result);

            const newOwnerBalance = await getBalance(currentOwner);

            assert.equal(
                toBN(ownerBalance).add(toBN(contractBalance)).sub(gas),
                newOwnerBalance,
                "Owner doesn't have contract balance"
            );
        })

        it("should have contract balance of 0", async() => {
            const contractBalance = await getBalance(_contract.address);

            assert.equal(
                contractBalance,
                0,
                "Contract doesn't have 0 balance"
            );
        })
    })

    describe("Self destruct", async() => {
        let currentOwner;

        before(async() => {
            currentOwner = await _contract.getContractOwner();
        })

        after(async() => {
            await _contract.resumeContract({from: currentOwner});
        })

        it("should fail when contract is NOT stopped", async() => {
            await catchRevert(_contract.selfDestruct({from: currentOwner}));
        })

        it("should have +contract funds on contract owner", async() => {
            await _contract.stopContract({from: contractOwner});

            const contractBalance = await getBalance(_contract.address);
            const ownerBalance = await getBalance(currentOwner);

            const result = await _contract.selfDestruct({from: currentOwner});
            const gas = await getGas(result);

            const newOwnerBalance = await getBalance(currentOwner);

            assert.equal(
                toBN(ownerBalance).add(toBN(contractBalance)).sub(gas),
                newOwnerBalance,
                "Owner doesn't have contract balance"
            );
        })

        it("should have contract balance of 0", async() => {
            const contractBalance = await getBalance(_contract.address);

            assert.equal(
                contractBalance,
                0,
                "Contract doesn't have 0 balance"
            );
        })

        it("should have 0x bytecode", async() => {
            const code = await web3.eth.getCode(_contract.address);

            assert.equal(
                code,
                "0x",
                "Contract is not destroyed"
            );
        })
    })
})