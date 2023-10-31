import { Box, Grid, Stack, Typography } from "@mui/material";
import { ReactElement, Fragment } from "react";
import { Section } from "../../types";
import { timeString } from "../../utils/timeString";


function percentHeight(mins: number, totalMins: number): string {
    return `${100*(mins / totalMins)}%`;
}

function hourString(hour: number): string {
    const pm = hour >= 12;
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    return hour + (pm ? "PM" : "AM");
}


const GRID_COLOR = "#ddd"

export default function Calendar(ps: { sections: Section[] }) {
    // Calculate the minimum and maximum time to display
    let [minHour, maxHour] = [8, 16];
    for (let section of ps.sections) {
        for (let time of section.section.timeRanges) {
            if (time.startHour < minHour) minHour = time.startHour;
            const endHour = time.endHour + (time.endMinute>0 ? 1 : 0);
            if (endHour > maxHour) maxHour = endHour;
        }
    }

    const minMinute = minHour*60;
    // Add 15 to add some buffer space at the end so the calendar isn't cramped
    const totalMinutes = (maxHour - minHour) * 60 + 15;
    // Check if any times are 5 or 6 (sunday or saturday)
    const weekendClasses = ps.sections.find(s => s.section.timeRanges.find(t => t.dayOfWeek >= 5));
    const numberOfDays = weekendClasses ? 7 : 5;

    const days: { start: number, end: number, text: ReactElement }[][]
          = Array.from(new Array(numberOfDays), () => []);

    for (let section of ps.sections) {
        for (let time of section.section.timeRanges) {
            days[time.dayOfWeek].push({
                start: time.startHour*60 + time.startMinute,
                end: time.endHour*60 + time.endMinute,
                text: (
                    <Stack justifyContent="space-between" className="calendar-event-content">
                        <Typography variant="h1" fontSize="1.15em" mt={1}>
                            {section.course.shortName}
                        </Typography>
                        <Typography variant="h2" fontSize="1.0em" textAlign="right">{
                            timeString(time.startHour, time.startMinute) + " - "
                                + timeString(time.endHour, time.endMinute)
                        }</Typography>
                    </Stack>
                ),
            });
        }
    }

    // Sort each day chronologically
    for (let dayArray of days) {
        dayArray.sort((a, b) => a.start - b.start);
    }

    days.unshift(Array.from(new Array(maxHour - minHour), (_, i) => ({
        start: (minHour+i)*60,
        end: (minHour+i)*60+60,
        text: (
            <Box position="relative">
                <Box position="absolute" left="-20px" height="1px" width="100vw" bgcolor={GRID_COLOR} />
                <Typography variant="overline" color="gray" position="relative">
                    {hourString(minHour+i)}
                </Typography>
            </Box>
        ),
    })));

    const dayLayouts = days.map((day, dayIdx) => {
        let prevMinute = 0;
        const events = day.map(({ start, end, text }) => {
            const vertSpace = (start-minMinute) - prevMinute;
            prevMinute = end-minMinute;
            return (
                <Fragment key={Math.random()}>
                    <Box height={percentHeight(vertSpace, totalMinutes)} />
                    <Box zIndex={1} width="95%" height={percentHeight(end-start, totalMinutes)}>
                        {text}
                    </Box>
                </Fragment>
            );
        });
        return (
            // If dayIdx==0, set xs=0, meaning shrink as thin as possible
            <Grid key={dayIdx} item xs={dayIdx ? 3 : 0} p={0} pt={2}>
                <Stack key={dayIdx} alignItems="center" height="100%" borderRight={`1px solid ${GRID_COLOR}`}>
                    <Typography variant="h2" fontSize="1.2em">
                        {["\u{2064}","Mon","Tue","Wed","Thu","Fri","Sat","Sun"][dayIdx]}
                    </Typography>
                    {events}
                </Stack>
            </Grid>
        );
    });

    return <Grid container spacing={0} wrap="nowrap" height="98%" width="98%">{dayLayouts}</Grid>
}
