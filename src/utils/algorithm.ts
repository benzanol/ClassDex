import solver from "javascript-lp-solver";
import { CourseOrder, CoursePreferences, CourseTimeRange, Section } from "../types";


// Calculating Overlap

function doTimesOverlap(t1: CourseTimeRange, t2: CourseTimeRange): boolean {
    if (t1.dayOfWeek !== t2.dayOfWeek) {
        return false;
    }

    let lhsStartTimestamp = t1.startHour * 60 + t1.startMinute;
    let lhsEndTimestamp = t1.endHour * 60 + t1.endMinute;
    let rhsStartTimestamp = t2.startHour * 60 + t2.startMinute;
    let rhsEndTimestamp = t2.endHour * 60 + t2.endMinute;

    if (rhsEndTimestamp < lhsStartTimestamp || lhsEndTimestamp < rhsStartTimestamp) {
        return false
    }
    return true;
}

function doSectionsOverlap(s1: Section, s2: Section): boolean {
    if (s1.section.timeRanges == undefined || s2.section.timeRanges == undefined) {
        return false
    }
    for (let i = 0; i < s1.section.timeRanges.length; i += 1) {
        for (let j = i; j < s2.section.timeRanges.length; j += 1) {
            if (doTimesOverlap(s1.section.timeRanges[i], s2.section.timeRanges[j])) {
                return true;
            }
        }
    }

    return false;
}

function sectionTimeEquivClasses(sections: Section[]): Section[][] {
    const equivs: Section[][] = [];
    function alreadyOverlapped(s1: Section, s2: Section): boolean {
        return Boolean(equivs.find(equiv => equiv.includes(s1) && equiv.includes(s2)));
    }

    for (let s1 of sections) {
        for (let s2 of sections) {
            if (s1 === s2 || !doSectionsOverlap(s1, s2) || alreadyOverlapped(s1, s2)) continue;

            const equivClass = [s1, s2];
            equivs.push(equivClass);

            // Add an equivalence class of all sections that overlap with both s1 and s2
            for (let s3 of sections) {
                if (s3 !== s1 && s3 !== s2 && doSectionsOverlap(s1, s3) && doSectionsOverlap(s2, s3)) {
                    equivClass.push(s3);
                }
            }
        }
    }

    return equivs;
}


// Calculating times

function calculateOptimalTimes(
    sections: [Section, number][],
    minCredits: number, maxCredits: number,
): Section[] | null {
    const overlapEquivs = sectionTimeEquivClasses(sections.map(([sec]) => sec));

    // Each section is a variable, which can be either 0 or 1 in the output
    const sectionVariables = sections.map(([section, happy]) => [
        section.section.crn,
        {
            happy,
            credits: section.course.creditHours,
            [section.course.id]: 1,
            ...Object.fromEntries(overlapEquivs.map((equiv, idx) => (
                [`overlap${idx}`, equiv.includes(section) ? 1 : 0]
            ))),
            ...Object.fromEntries(sections.map(([s], i) => [`section${i}`, s === section ? 1 : 0]))
        },
    ]);

    // No overlapping sections
    const overlapConstraints = overlapEquivs.map((_, i) => [`overlap${i}`, { max: 1 }]);

    // Only 0 or 1 of each section
    const sectionConstraints = sections.map((_, i) => [`section${i}`, { min: 0, max: 1 }]);

    // No more than 1 section of a course
    const courseIds = [...new Set(sections.map(([section]) => section.course.id))]
    const courseConstraints = courseIds.map(cid => [cid, { max: 1 }]);

    const model = {
        optimize: "happy",
        opType: "max",
        constraints: Object.fromEntries([
            ...overlapConstraints,
            ...sectionConstraints,
            ...courseConstraints,
            ["credits", { min: minCredits, max: maxCredits }],
        ]),
        variables: Object.fromEntries(sectionVariables),
        // Make sure each course variable is an integer
        ints: Object.fromEntries(sections.map(([section]) => [section.section.crn, 1]))
    };

    // console.log(model);

    const result = solver.Solve(model);
    if (!result.feasible) return null;

    return sections.map(([section]) => section)
        .filter(section => section.section.crn in result);
}

export function calculateSchedule(
    sections: Section[], order: CourseOrder, prefs: CoursePreferences,
): Section[] {
    const optionalIndex = order.indexOf("Optional");

    const sectionPrefs = sections.map(s => (
        [s, order.indexOf(s.course) < optionalIndex ? 10 : 1] as [Section, number]
    ));

    if (prefs.time === "late") {
        for (let sec of sectionPrefs) {
            sec[1] += sec[0].section.timeRanges[0].startHour / 3
        }
    }
    if (prefs.time === "early") {
        for (let sec of sectionPrefs) {
            sec[1] += (24 - sec[0].section.timeRanges[0].startHour) / 3
        }
    }

    console.log("Min =", prefs.minCredits, "Max =", prefs.maxCredits)
    console.log(
        "Your preferences: \n",
        sectionPrefs.map(([sec, pref]) => (
            sec.course.id + " " + sec.section.crn + ": " + pref
        )).join("\n")
    );

    return calculateOptimalTimes(
        sectionPrefs,
        prefs.minCredits ?? 0,
        prefs.maxCredits ?? 18,
    ) ?? [];
}
