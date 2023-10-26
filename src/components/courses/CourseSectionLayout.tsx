import { Card, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { CurrentSectionData, Section, SectionSession } from "../../types"
import { timeString } from "../../utils/timeString";
import { addOrRemoveSectionButton } from "./CourseHeaderLayout";
import SectionTimeLayout from "./SectionTimeLayout";



export default function CourseSectionLayout(ps: { section: Section, mySections: CurrentSectionData }) {
    // Check if the user hsa this section selected
    const sectionIsAdded = ps.mySections.sections.includes(ps.section);

    return (
        <Card variant="outlined" sx={{
                  p: 1, pt: 1.5, pb: 1, my: 1,
                  backgroundColor: sectionIsAdded ? "#f0f2f6" : "transparent"
              }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack>
                    { <SectionTimeLayout section={ps.section} /> }

                    <Stack sx={{ pt: 1 }} direction="row" alignItems="center">
                        <Typography sx={{ fontSize: "1.1em", pr: 1 }}>Instructor:</Typography>
                        <Typography sx={{ fontSize: "1.1em", fontWeight: "light" }}>
                            { ps.section.section.instructor }
                        </Typography>
                    </Stack>
                </Stack>

                <Stack alignItems="center">
                    {/* Wrap the button in an extra div so it doesn't take up the full width */}
                    <div>{ addOrRemoveSectionButton(!sectionIsAdded, [ps.section], ps.mySections) }</div>
                    <Typography sx={{ pb: 0.5, fontWeight: "light", fontSize: "0.9em" }}>
                        CRN: { ps.section.section.crn }
                    </Typography>
                </Stack>
            </Stack>
        </Card>
    );
}
