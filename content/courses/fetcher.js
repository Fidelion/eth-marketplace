import courses from "./index.json";

export const getAllCourses = () => {
    return {
        data: courses,
        courseMap: courses.reduce((accu, c, i) => {
            accu[c.id] = c;
            accu[c.id].index = i; 
            return accu;
        }, {})
    }
}