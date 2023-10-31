import { Course, Section } from "../types";
import courses from "./courseData";


export function sectionChronologicalOrder(sections: Section[]): Section[] {
    return sections
        .map(section => [section, Math.min(...section.section.timeRanges.map(
            time => time.startMinute + 60*(time.startHour + 24*time.dayOfWeek)
        ))] as const)
        .sort(([_s1, time1], [_s2, time2]) => time1 - time2)
        .map(([section, _time]) => section);
}

export function getAll() {
    let allCourses = (courses as Course[]).filter(c => c.sections?.length);

    // Remove sections that don't have a time
    for (let c of allCourses) {
        c.sections = c.sections.filter(s => s.timeRanges?.length > 0);
    }

    // Remove courses that don't have a section
    allCourses = allCourses.filter(c => c.sections.length);

    // Add full section objects to each course
    const allSections: Section[] = []
    for (let course of allCourses) {
        // Shorten the name
        course.shortName = course.name.length <= 50 ? course.name : course.name.substring(0, 47) + "...";

        course.fullSections = [];
        course.sections.forEach(section => {
            section.timeRanges.forEach(range => {
                range.dayOfWeek = (range.dayOfWeek - 2 + 7) % 7;
            });

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
