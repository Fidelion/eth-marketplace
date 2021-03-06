// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CourseMarketplace {
    enum State {
        Purchased,
        Activated,
        Deactivated
    }

    struct Course {
        uint256 id; //32 bytes
        uint256 price; //32 bytes
        bytes32 proof; //32 bytes
        address owner; //20 bytes
        State state; //1 byte
    }

    bool public isStopped = false;

    //Mapping of courseHash to Course data
    mapping(bytes32 => Course) private ownedCourses;

    //Mapping of courseId to courseHash
    mapping(uint256 => bytes32) private ownedCourseHash;

    uint256 private totalOwnedCourses;

    address payable private owner;

    constructor() {
        setContractOwner(msg.sender);
    }

    ///Course already has an owner
    error CourseError();

    ///Only owner is allowed to change ownership of the contract
    error OwnerError();

    ///Course has not been activated
    error CourseIsNotCreated();

    ///This sender is not owner of this course
    error IsNotCourseOwner();

    ///Course has invalid state;
    error InvalidState();

    modifier onlyOwner() {
        if (msg.sender != getContractOwner()) {
            revert OwnerError();
        }
        _;
    }

    modifier onlyWhenNotStopped() {
        require(!isStopped);
        _;
    }

    modifier onlyWhenStopped() {
        require(isStopped);
        _;
    }

    receive() external payable {}

    function withdraw(uint256 amount) external onlyOwner {
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed.");
    }

    function emergencyWithdraw() external onlyWhenStopped onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    function selfDestruct() external onlyWhenStopped onlyOwner {
        selfdestruct(owner);
    }

    function stopContract() external onlyOwner {
        isStopped = true;
    }

    function resumeContract() external onlyOwner {
        isStopped = false;
    }

    // address - 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
    // courseId - 0x00000000000000000000000000003130
    // proof - 0x0000000000000000000000000000313000000000000000000000000000003130

    //0x305697b3bc073ddea5b04fb9b7fb28fc3ff90fdaf47890884093525b0c1ff5e7
    function purchaseCourse(bytes16 courseId, bytes32 proof)
        external
        payable
        onlyWhenNotStopped
    {
        //courseHash = 000000000000000000000000000031305B38Da6a701c568545dCfcB03FcB875f56beddC4
        bytes32 courseHash = keccak256(abi.encodePacked(courseId, msg.sender));

        if (hasCourseOwnership(courseHash)) {
            revert CourseError();
        }

        uint256 id = totalOwnedCourses++;

        ownedCourseHash[id] = courseHash;

        ownedCourses[courseHash] = Course({
            id: id,
            price: msg.value,
            proof: proof,
            owner: msg.sender,
            state: State.Purchased
        });
    }

    function repurchaseCourse(bytes32 courseHash)
        external
        payable
        onlyWhenNotStopped
    {
        if (!isCourseCreated(courseHash)) {
            revert CourseIsNotCreated();
        }

        if (!hasCourseOwnership(courseHash)) {
            revert IsNotCourseOwner();
        }

        Course storage course = ownedCourses[courseHash];

        if (course.state != State.Deactivated) {
            revert InvalidState();
        }

        course.state = State.Purchased;
        course.price = msg.value;
    }

    function activateCourse(bytes32 courseHash)
        external
        onlyWhenNotStopped
        onlyOwner
    {
        if (!isCourseCreated(courseHash)) {
            revert CourseIsNotCreated();
        }

        Course storage course = ownedCourses[courseHash];

        if (course.state != State.Purchased) {
            revert InvalidState();
        }

        course.state = State.Activated;
    }

    function deactivateCourse(bytes32 courseHash)
        external
        onlyWhenNotStopped
        onlyOwner
    {
        if (!isCourseCreated(courseHash)) {
            revert CourseIsNotCreated();
        }

        Course storage course = ownedCourses[courseHash];

        if (course.state != State.Purchased) {
            revert InvalidState();
        }

        (bool success, ) = course.owner.call{value: course.price}("");
        require(success, "Transfer Failed!");

        course.state = State.Deactivated;
        course.price = 0;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        setContractOwner(newOwner);
    }

    function getTotalCourses() external view returns (uint256) {
        return totalOwnedCourses;
    }

    function getCourseAtIndex(uint256 index) external view returns (bytes32) {
        return ownedCourseHash[index];
    }

    function getCourseAtHash(bytes32 courseHash)
        external
        view
        returns (Course memory)
    {
        return ownedCourses[courseHash];
    }

    function getContractOwner() public view returns (address) {
        return owner;
    }

    function isCourseCreated(bytes32 courseHash) private view returns (bool) {
        return
            ownedCourses[courseHash].owner !=
            0x0000000000000000000000000000000000000000;
    }

    function setContractOwner(address setOwner) private {
        owner = payable(setOwner);
    }

    function hasCourseOwnership(bytes32 courseHash)
        private
        view
        returns (bool)
    {
        return ownedCourses[courseHash].owner == msg.sender;
    }
}
