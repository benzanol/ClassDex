import { Course, Section } from "../types";
import courses from "./courses";


export function sectionChronologicalOrder(sections: Section[]): Section[] {
    return sections
        .map(section => [section, Math.min(...section.section.timeRanges.map(
            time => time.startMinute + 60*(time.startHour + 24*time.dayOfWeek)
        ))] as const)
        .sort(([_s1, time1], [_s2, time2]) => time1 - time2)
        .map(([section, _time]) => section);
}


export function getAll() {
    let allCourses = (courses as Course[]);

    // Remove sections that don't have a time
    for (let c of allCourses) {
        c.sections = c.sections.filter(s => s.timeRanges?.length > 0);
    }

    // Remove courses that don't have a section
    allCourses = allCourses.filter(c => c.sections.length);

    // Add full section objects to each course
    const allSections: Section[] = []
    for (let course of allCourses) {
        course.fullSections = [];
        course.sections.forEach(section => {
            const fullSection = { course, section };
            course.fullSections.push(fullSection);
            allSections.push(fullSection);
            return fullSection;
        });
        course.fullSections = sectionChronologicalOrder(course.fullSections);
    }

    return {
        courses: allCourses,
        sections: allSections,
    };
}
