import { Stack, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { Course, CurrentSectionData } from "../../types";
import CourseSectionLayout from "./CourseSectionLayout";

import clockImage from "../../assets/icons/clock.jpg";
import personImage from "../../assets/icons/person.jpg";
import worldImage from "../../assets/icons/world.jpg";
import aImage from "../../assets/icons/a.jpg";
import CourseEvaluation from "./CourseEvaluation";


function gridItem(image: string, alt: string, text: string) {
    return (
        <TableCell sx={{ borderBottom: "none", py: 1 }}>
            <Stack direction="row" alignItems="center">
                <img alt={alt} src={image} style={{ width: "20px" }} />
                <Typography sx={{ ml: 2, fontSize: "1.3em" }}>{ text }</Typography>
            </Stack>
        </TableCell>
    );
}


export default function CourseBodyLayout(ps: {
    course: Course,
    mySections: CurrentSectionData,
}) {
    return (
        <>
            <Table sx={{ mt: 0, mb: 2, pt: 0 }}>
                <TableBody>
                    <TableRow>
                        { gridItem(clockImage, "Clock", (ps.course.creditHours ?? "?") + " Credit Hours") }
                        { gridItem(personImage, "Person", ps.course.courseType) }
                    </TableRow>
                    <TableRow>
                        { gridItem(
                            worldImage, "Distribution",
                            ps.course.distributionGroup ?? "No Distribution Credit"
                        ) }
                        { gridItem(aImage, "A", ps.course.gradeMode) }
                    </TableRow>
                </TableBody>
            </Table>
            {
                ps.course.fullSections.map((section) => (
                    <CourseSectionLayout key={section.section.crn}
                                         section={section}
                                         mySections={ps.mySections} />
                ))
            }
            {
                ps.course.prerequisites && (
                    <Stack direction="row" alignItems="center" mb="0">
                        <Typography my={2} variant="h2" mb="0" fontSize="1.2em" pr="4px">Prerequisities: </Typography>
                        <Typography my={2} variant="h2" mb="0" fontSize="1em">{ ps.course.prerequisites }</Typography>
                    </Stack>
                )
            }
            <Typography my={2}>{ ps.course.description }</Typography>
            <CourseEvaluation course={ps.course} />
        </>
    );
};
