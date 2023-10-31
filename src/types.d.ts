// Courses/Sections

export type CourseTimeRange = {
    dayOfWeek: number,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
};

export type CourseSection = {
    id: string,
    crn: string,
    timeRanges: CourseTimeRange[],
    location: string,
    instructor: string,
    baseLocation?: string,
    instructorRating?: number,
    instructorReviews?: number,
};

export type Course = {
    id: string,
    name: string,
    shortName: string,
    creditHours: number,
    courseType: string,
    languageOfInstruction: string,
    department: string,
    gradingMode?: string,
    prerequisites: string,
    description: string,
    satisfiesDistribution?: string,
    methodOfInstruction: string,
    finalExam: string,
    gradeMode: string,
    analyzingDiversity: boolean,
    sections: CourseSection[],
    fullSections: Section[],
};

export type Section = {
    course: Course,
    section: CourseSection,
};


// UX

export type SectionSession = { start: string, end: string, days: number[] };

export type CourseOrder = (Course | "Optional")[];

export type SavedSchedule = {
    sections: string[],
    time: string,
    name?: string,
};

export type CurrentSectionData = {
    sections: Section[],
    order: CourseOrder,
    add: (...s: Section[]) => void,
    remove: (...s: Section[]) => void,
    reorder: (start: number, end: number) => void,
};


// Preferences

export type CoursePreferences = Partial<{
    time: "early" | "late" | "middle",
    minCredits: number,
    maxCredits: number,
    noGaps?: boolean,
}>;


// Algorithm

export type SessionWithMetadata = {
    session: CourseSection;
    weight: number;
    credit: number;
    courseId: string;
}

