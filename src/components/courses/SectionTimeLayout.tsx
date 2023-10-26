import { Card, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { Section, SectionSession } from "../../types";
import { timeString } from "../../utils/timeString";


export default function SectionTimeLayout(ps: { section: Section }) {
    // Group time ranges by same start and end times on different days
    const ranges: SectionSession[] = [];
    for (let time of ps.section.section.timeRanges) {
        const startStr = timeString(time.startHour, time.startMinute);
        const endStr = timeString(time.endHour, time.endMinute);

        // Figure out if there are other days with this same time range
        const existing = ranges.find(({ start, end }) => start===startStr && end===endStr);
        if (existing) {
            existing.days.push(time.dayOfWeek);
        } else {
            ranges.push({ start: startStr, end: endStr, days: [time.dayOfWeek] });
        }
    }

    const timeLayouts = ranges.map(({ start, end, days }) => (
        <Stack direction="row" alignItems="bottom">
            {
                [6,0,1,2,3,4,5].map(day => (
                    <Card key={day}
                          variant="outlined"
                          sx={{
                              backgroundColor: days.includes(day) ? "#246" : "transparent",
                              color: days.includes(day) ? "white" : "black",
                              width: "18px",
                              height: "18px",

                              border: "2px solid #246",
                              borderRadius: "6px",
                              padding: "1px 2px 4px 2px",

                              fontWeight: "bold",
                              textAlign: "center",
                              fontSize: "16px",
                          }}
                    >
                        { "MTWRFSS"[day] }
                    </Card>
                ))
            }
            <Typography sx={{ fontWeight: "light", fontSize: "1.1em", pl: 2 }}>
                { start + " - " + end }
            </Typography>
        </Stack>
    ));

    return <>{ timeLayouts }</>;
}
