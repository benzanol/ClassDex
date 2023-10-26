import { ReactElement, useState, useEffect } from "react";
import CourseHeaderLayout from "./CourseHeaderLayout";
import { CurrentSectionData, Course } from "../../types";
import { Stack } from "@mui/system";
import CourseBodyLayout from "./CourseBodyLayout";
import { ExpandMore } from "@mui/icons-material";
import { isValidElement } from "react";
import * as DragAndDrop from "../../utils/dragAndDrop";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Box, Pagination } from "@mui/material";

export default function CourseList(ps: {
    courses: (Course | ReactElement)[],
    mySections: CurrentSectionData,
    reorder?: (s: number, e: number) => void,
}) {
    const [expanded, setExpanded] = useState(false as string | false);
    function handleExpand(key: string) {
        return (_event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? key : false);
        };
    }

    // Page is 1 indexed
    const [page, setPage] = useState(1);

    const coursesPerPage = 50;
    let courses = ps.courses;
    let pageCount = Math.ceil(courses.length / coursesPerPage);
    if (pageCount > 1) {
        courses = courses.slice((page-1) * coursesPerPage, page * coursesPerPage);
    }

    const pageSelector = pageCount > 1 && (
        <Pagination sx={{ my: 1 }}
                    count={pageCount}
                    page={page}
                    onChange={(_, value) => setPage(value)}
        />
    );


    useEffect(() => {
        if (!ps.reorder) return;

        for (let div of Array.from(document.getElementsByClassName("grabber-container"))) {
            const grabber = DragAndDrop.createGrabber(ps.reorder);
            div.replaceChildren(grabber);
        }
    });


    const courseLayouts = courses.map((course, idx) => {
        if (isValidElement(course)) return course;

        // Disable gutters makes the accordian stay still when you're expanding it
        // Unmount on exit makes it so that the content is not loaded until you expand the accordian
        return (
            <Accordion
                key={course.id}
                elevation={3}
                expanded={expanded === course.id}
                onChange={handleExpand(course.id)}
                TransitionProps={{ unmountOnExit: true }}
                width="100%"
            >
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Stack direction="row" alignItems="center" width="100%">
                        <CourseHeaderLayout course={course} mySections={ps.mySections}
                                            grabber={ps.reorder ? (
                                                <div className="grabber-container">
                                                    <span className="grabber">⠿</span>
                                                </div>
                                            ) : undefined}
                        />
                    </Stack>
                </AccordionSummary>

                <AccordionDetails>
                    <CourseBodyLayout course={course} mySections={ps.mySections} />
                </AccordionDetails>
            </Accordion>
        );
    });

    return (
        <Box width="100%">
            { pageSelector }
            <Box width="100%" className="drag-container">
                { courseLayouts }
            </Box>
            { pageSelector }
        </Box>
    );

}
