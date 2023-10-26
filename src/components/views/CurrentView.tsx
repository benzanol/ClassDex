import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { CurrentSectionData } from "../../types";
import CourseList from "../courses/CourseList";
import BrowseView from "./BrowseView";
import SearchBar from "./SearchBar";


export default function CurrentView(ps: { mySections: CurrentSectionData, generate: () => void }) {
    // The current search term
    const [search, setSearch] = useState(null as null | string);

    if (search !== null) return (
        <BrowseView mySections={ps.mySections} goBack={() => setSearch(null)}
                    search={search} setSearch={setSearch}
        />
    );


    const courseLayouts = ps.mySections.order.map(c => c !== "Optional" ? c : (
        <Box mb={2} mt={4}>
            <Divider>
                <Typography variant="h2" fontSize="1.3em">Optional Courses</Typography>
            </Divider>
        </Box>
    ));

    // const noRequiredCoursesLabel = ps.mySections.order[0] === "Optional" && (
    //     <Typography fontSize="0.9em" color="gray" pl={2}>{ "No required courses" }</Typography>
    // );

    return (
        <Stack height="100%" justifyContent="space-between">
            <Stack alignItems="left">
                <Stack direction="row" alignItems="center" spacing={2} py={2}>
                    <SearchBar label="Add desired courses" initial={search ?? ""} setSearch={setSearch} />
                    <Button variant="contained" size="large" onClick={ps.generate}
                            sx={{ minWidth: "fit-content", height: "50px", p: 2 }}
                    >
                        Generate Schedule
                    </Button>
                </Stack>
                <Box mb={2}>
                    <Divider>
                        <Typography variant="h2" fontSize="1.3em">Required Courses</Typography>
                    </Divider>
                </Box>
                {/* { noRequiredCoursesLabel } */}
                <CourseList courses={courseLayouts} mySections={ps.mySections}
                            reorder={(start, end) => ps.mySections.reorder(start, end)}
                />
            </Stack>
        </Stack>
    );
}
