import { Course, CourseOrder, CoursePreferences, CourseTimeRange, Section } from "../types";



export function timeString(range: CourseTimeRange): string {
    let hour = range.startHour;
    let minute = range.startMinute;

    const pm = hour >= 12;
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    const str = `${hour}`.padStart(2, "0") + ":" + `${minute}`.padStart(2, "0") + (pm ? "PM" : "AM");
    return ["M","T","W","R","F","S","U"][range.dayOfWeek] + " - " + str;
}

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
    if (!s1.section.timeRanges || !s2.section.timeRanges) {
        return false
    }
    for (let t1 of s1.section.timeRanges) {
        for (let t2 of s2.section.timeRanges) {
            if (doTimesOverlap(t1, t2)) {
                return true;
            }
        }
    }

    return false;
}

function anySectionsOverlap(decided: Section[], section: Section): boolean {
    for (let s of decided) {
        if (doSectionsOverlap(s, section)) return true;
    }
    return false;
}


function sectionTimePreference(section: Section, prefs: CoursePreferences): number {
    if (prefs.time === "late") {
        return section.section.timeRanges[0].startHour;
    }
    if (prefs.time === "early") {
        return (24 - section.section.timeRanges[0].startHour);
    }
    return 0;
}


export function scheduleScore(sections: Section[], prefs: CoursePreferences): number {
    const hourScore = sections.reduce((acc, sec) => acc + sectionTimePreference(sec, prefs), 0);

    // Generate a list of courses by day
    const days: { start: number, end: number }[][] = Array.from(new Array(7), () => []);
    for (let section of sections) {
        for (let time of section.section.timeRanges) {
            days[time.dayOfWeek].push({
                start: time.startHour*60 + time.startMinute,
                end: time.endHour*60 + time.endMinute,
            });
        }
    }

    // Sort each day chronologically
    for (let dayArray of days) {
        dayArray.sort((a, b) => a.start - b.start);
    }

    // Count the number of gaps in each day
    let nogapCount = 0;
    let totalStartMinusEnd = 0;
    for (let day of days) {
        let firstClass = day[0];
        let lastClass = day.pop();

        if (firstClass && lastClass) {
            totalStartMinusEnd += lastClass.end - firstClass.start;
        }

        while (lastClass && day.length) {
            let curClass = day.pop()!;
            if (lastClass.start - curClass.end <= 15) nogapCount += 1;
            lastClass = curClass;
        }
    }

    const credits = sections.reduce((acc, { course }) => acc + course.creditHours, 0);

    // TotalStartMinusEnd is on the order of 60*5*5 = 1500
    return hourScore*2 + credits*2 + nogapCount*2 - (totalStartMinusEnd / 60);
}


export function optimalOptionalCourses(
    decided: Section[], decidedCredits: number,
    optional: Course[], prefs: CoursePreferences,
): [Section[], number] {
    if (optional.length === 0) return [decided, scheduleScore(decided, prefs)];

    let bestSections = decided;
    let bestScore = scheduleScore(decided, prefs);

    for (let i = 0; i < optional.length; i++) {
        const course = optional[i];
        for (let section of course.fullSections) {
            if (
                anySectionsOverlap(decided, section)
                    || decidedCredits+section.course.creditHours > (prefs.maxCredits ?? 18)
            ) continue;

            // No more than one FWIS
            if (section.course.id.startsWith("FWIS") && decided.find(s => s.course.id.startsWith("FWIS"))) continue;
            if (section.course.id.startsWith("LPAP") && decided.find(s => s.course.id.startsWith("LPAP"))) continue;

            const newSections = [...decided, section];
            const newCredits = decidedCredits + course.creditHours;
            const [recursiveSections, recursiveScore] = optimalOptionalCourses(
                newSections, newCredits, optional.slice(i+1), prefs,
            );

            // Update the best score
            if (recursiveScore > bestScore) {
                bestScore = recursiveScore;
                bestSections = recursiveSections;
            }
        }
    }

    return [bestSections, bestScore];
}

export function optimalSchedule(
    decided: Section[], decidedCredits: number,
    required: Course[], optional: Course[],
    prefs: CoursePreferences,
): [Section[], number] {
    console.log("req", required, decided, optional.length, decidedCredits);

    if (required.length === 0) return optimalOptionalCourses(
        decided, decidedCredits, optional, prefs
    );

    let bestSections = [];
    let bestScore = -Infinity;

    for (let section of required[0].fullSections) {
        if (anySectionsOverlap(decided, section)) continue;

        const newSections = [...decided, section];
        const newCredits = decidedCredits + required[0].creditHours;

        // This will use required/optional with a thing removed
        const [recursiveSections, recursiveScore] = optimalSchedule(
            newSections, newCredits, required.slice(1), optional, prefs
        );

        // Update the best score
        if (recursiveScore > bestScore) {
            bestScore = recursiveScore;
            bestSections = recursiveSections;
        }
    }

    return [bestSections, bestScore];
}



export function calculateSchedule(
    sections: Section[], order: CourseOrder, prefs: CoursePreferences,
): Section[] {
    const optionalIndex = order.indexOf("Optional");

    const required = order.slice(0, optionalIndex) as Course[];
    const optional = order.slice(optionalIndex + 1) as Course[];

    const [requiredCopy, optionalCopy] = [required, optional].map(list => list.map(course => ({
        creditHours: course.creditHours,
        fullSections: course.fullSections.filter(s => sections.includes(s)),
    } as Course)));

    console.log(requiredCopy, optionalCopy);

    return optimalSchedule([], 0, requiredCopy, optionalCopy, prefs)[0];
}
