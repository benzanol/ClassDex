import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Popover, Select, Stack } from "@mui/material";
import { Course } from "../../types";

export type CourseFilter = Partial<{
    d1: boolean,
    d2: boolean,
    d3: boolean,
    ad: boolean,
    time: string, // 'MFW 8:00' or 'TR 10:50'
}>;

export function satisfiesFilter(course: Course, filter: CourseFilter): boolean {
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
        <MenuItem value={timeStr}>{timeStr}</MenuItem>
    ));

    console.log(ps.filter)

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
            <Stack p={2}>

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

            </Stack>
        </Popover>
    )
}
