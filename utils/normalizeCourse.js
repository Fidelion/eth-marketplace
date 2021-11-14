export const COURSE_STATE = {
    0: "purchased",
    1: "activated",
    2: "deactivated"
}

export const normalize = web3 => (course, ownedCourse) => {
    return {
        ...course,
        ownedCourseId: ownedCourse.id,
        proof: ownedCourse.proof,
        owner: ownedCourse.owner,
        price: web3.utils.toWei(ownedCourse.price),
        state: COURSE_STATE[ownedCourse.state]
    }
}