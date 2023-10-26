import { Course, CourseOrder, SavedSchedule, Section } from "../types";



export function getLocalStorage(courses: Course[], sections: Section[]) {
    // Parse local storage
    const localCourseOrderString = localStorage.getItem("courseOrder");
    let initialCourseOrder: CourseOrder = ["Optional"];
    if (localCourseOrderString) {
        initialCourseOrder = (JSON.parse(localCourseOrderString) as string[]).map(str => {
            if (str === "Optional") return str;
            return courses.find(course => course.id === str)!;
        });
        if (!initialCourseOrder.includes("Optional")) {
            initialCourseOrder.unshift("Optional");
        }
    }

    const localSectionsString = localStorage.getItem("sections");
    let initialSections: Section[] = [];
    if (localSectionsString) {
        initialSections = (JSON.parse(localSectionsString) as string[]).map(crn => {
            return sections.find(section => section.section.crn === crn)!;
        });
    }

    const localSavedSchedulesString = localStorage.getItem("savedSchedules");
    let initialSavedSchedules: SavedSchedule[] = [];
    if (localSavedSchedulesString) {
        initialSavedSchedules = JSON.parse(localSavedSchedulesString) as SavedSchedule[];
    }

    return {
        order: initialCourseOrder,
        sections: initialSections,
        saved: initialSavedSchedules,
    };
}



export function saveSections(sections: Section[]) {
    localStorage.setItem("sections", JSON.stringify(sections.map(s => s.section.crn)));
}

export function saveCourseOrder(order: CourseOrder) {
    const selectedCourses = order.map(course => {
        if (course === "Optional") return course;
        else return course.id;
    });
    localStorage.setItem("courseOrder", JSON.stringify(selectedCourses));
}

export function saveSavedSchedules(saved: SavedSchedule[]) {
    localStorage.setItem("savedSchedules", JSON.stringify(saved));
}
