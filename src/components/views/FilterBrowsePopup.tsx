import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Popover, Select, Stack } from "@mui/material";
import { Course } from "../../types";
import { ClassEvalData } from "../../utils/evaluationData";
import { getEvals } from "../../utils/evaluations";

export type CourseFilter = Partial<{
    d1: boolean,
    d2: boolean,
    d3: boolean,
    ad: boolean,
    time: string, // 'MFW 8:00' or 'TR 10:50'
    credits: number,
    sort?: "grade" | "quality" | "challenge" | "workload",
}>;


export function sortCourses(courses: Course[], filter: CourseFilter): Course[] {
    if (!filter.sort) return courses;

    function evalAverage(es: ClassEvalData[]): number {
        if (es.length === 0) {
            return 0;
        } else if (filter.sort === "challenge") {
            return es[0][filter.sort].class;
        } else {
            return 5 - es[0][filter.sort].class;
        }
    }

    const newCourses = courses.map((course) => [
        course, evalAverage(Object.values(getEvals(course.id)))
    ] as const);
    newCourses.sort(([, a], [, b]) => b - a);
    return newCourses.map(([course, _eval]) => course);
}

export function satisfiesFilter(course: Course, filter: CourseFilter): boolean {
    if (filter.credits !== undefined && course.creditHours !== filter.credits) return false;

    if (filter.d1 && course.satisfiesDistribution !== `Distribution Group I`) {
        return false;
    } else if (filter.d2 && course.satisfiesDistribution !== `Distribution Group II`) {
        return false;
    } else if (filter.d3 && course.satisfiesDistribution !== `Distribution Group III`) {
        return false;
    } else if (filter.ad && !course.analyzingDiversity) {
        return false;
    }

    if (!filter.time) return true;

    const [days, timeStr] = filter.time.split(" ");
    const [hourStr, minStr] = timeStr.split(":");
    const totalMin = 60*(+hourStr) + (+minStr);
    const matchingTimeRange = course.sections.find(s => s.timeRanges.find(timeRange => (
        days.includes("SUMTWRF"[timeRange.dayOfWeek]) && (
            (timeRange.startHour*60 + timeRange.startMinute) == totalMin
        )
    )));

    return Boolean(matchingTimeRange);
}

export default function FilterBrowsePopup(ps: {
    anchor: JSX.Element | null,
    filter: CourseFilter,
    setFilter: (f: CourseFilter) => void,
    onClose: () => void,
}) {

    const checkboxes = ([
        ["d1", "Distribution 1"],
        ["d2", "Distribution 2"],
        ["d3", "Distribution 3"],
        ["ad", "Analyzing Diversity"],
    ] as const).map(([key, label]) => (
        <FormControlLabel
            key={key} label={label}
            control = {
                <Checkbox onChange={e => {
                              const newFilter = { ...ps.filter };
                              newFilter[key] = e.target.checked;
                              ps.setFilter(newFilter);
                          }}
                          checked={ps.filter[key]}
                />
            }
        />
    ));

    const timeValues = [
        ...Array.from(Array(8), (_, i) => `MWF ${i+8}:00`), // 8 to 4
        ...["8:00", "9:25", "10:50", "1:00", "2:30", "4:00"].map(time => `TR ${time}`),
    ];
    const timeSelectLayouts = timeValues.map(timeStr => (
        <MenuItem key={timeStr} value={timeStr}>{timeStr}</MenuItem>
    ));

    return (
        <Popover
            open={Boolean(ps.anchor)}
            onClose={ps.onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            anchorEl={ps.anchor as any}
        >
            <Stack p={2} spacing={2}>

                <Stack p={1} pr={3}>{checkboxes}</Stack>

                <FormControl fullWidth>
                    <InputLabel id="filter-day-label">Time</InputLabel>
                    <Select
                        labelId="filter-day-label"
                        label="Time"
                        value={ps.filter.time ?? ""}
                        onChange={(e) => ps.setFilter({
                            ...ps.filter,
                            time: e.target.value as string,
                        })}
                    >
                        <MenuItem value={""}>Any Time</MenuItem>
                        {...timeSelectLayouts}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="filter-credits-label">Credit Hours</InputLabel>
                    <Select
                        labelId="filter-credits-label"
                        label="Credit Hours"
                        value={ps.filter.credits ?? "any"}
                        onChange={(e) => ps.setFilter({
                            ...ps.filter,
                            credits: (e.target.value === "any") ? undefined : (+e.target.value),
                        })}
                    >
                        <MenuItem value={"any"}>Any</MenuItem>
                        {
                            [1, 2, 3, 4].map(credits => (
                                <MenuItem key={credits} value={credits.toString()}>
                                    {credits} Credit Hours
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="sort-by-label">Sort By</InputLabel>
                    <Select
                        labelId="sort-by-label"
                        label="Sort By"
                        value={ps.filter.sort ?? ""}
                        onChange={(e) => ps.setFilter({
                            ...ps.filter,
                            sort: (e.target.value as any) || undefined,
                        })}
                    >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="grade">Highest Grade</MenuItem>
                        <MenuItem value="quality">Highest Quality</MenuItem>
                        <MenuItem value="challenge">Least Challenging</MenuItem>
                        <MenuItem value="workload">Lowest Workload</MenuItem>
                    </Select>
                </FormControl>

            </Stack>
        </Popover>
    )
}
