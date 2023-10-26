import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import { Card, IconButton, Stack, Typography } from "@mui/material";
import { ReactElement } from "react";
import { CurrentSectionData, Course, Section } from "../../types";


export function addOrRemoveSectionButton(add: boolean, sections: Section[], hook: CurrentSectionData) {
    return (
        <IconButton onClick={(e) => {
                        e.stopPropagation();
                        if (add) hook.add(...sections);
                        else hook.remove(...sections);
                    }}>
            { add ? <AddCircleOutline /> : <RemoveCircleOutline /> }
        </IconButton>
    );
}


// Show an individual course in the course catalog
export default function CourseHeaderLayout(ps: {
    course: Course,
    mySections: CurrentSectionData,
    grabber?: ReactElement
}) {
    const numSectionsAdded = ps.course.fullSections.filter(s => ps.mySections.sections.includes(s)).length;

    // Display how many sections are added
    const sectionsAddedLabel = numSectionsAdded > 0 && (
        <span style={{ color: numSectionsAdded === ps.course.sections.length ? "green" : "orange" }}>
            ({ numSectionsAdded }/{ ps.course.sections.length })
        </span>
    );

    // A parent stack which aligns the first stack left and the second stack right
    return (
        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ width:"100%" }}>

            {/* The part of the header which is aligned left */}
            <Stack direction="row" alignItems="center" spacing={1}>
                { ps.grabber }
                <Typography className="course-id" variant="overline"
                            sx={{
                                fontSize: "0.7em",
                                px: 1,
                                lineHeight: "1.6",
                                textAlign: "center"
                            }}
                >
                    { ps.course.id.split(" ")[0] }
                    <br/>
                    { ps.course.id.split(" ")[1] }
                </Typography>
                <Typography sx={{ fontSize: "1.05em" }}>{ ps.course.name }</Typography>
            </Stack>

            {/* The part of the header which is aligned right */}
            <Stack direction="row" alignItems="center" spacing={1}>
                { sectionsAddedLabel }
                { addOrRemoveSectionButton(numSectionsAdded === 0, ps.course.fullSections, ps.mySections) }
            </Stack>

        </Stack>
    );
}
