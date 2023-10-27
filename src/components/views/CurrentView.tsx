import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { CoursePreferences, CurrentSectionData } from "../../types";
import CourseList from "../courses/CourseList";
import BrowseView from "./BrowseView";
import PreferencesPopup from "./PreferencesPopup";
import SearchBar from "./SearchBar";


export default function CurrentView(ps: {
    mySections: CurrentSectionData,
    generate: (p: CoursePreferences) => void,
}) {
    // The current search term
    const [search, setSearch] = useState(null as null | string);

    const [popoverAnchor, setPopoverAnchor] = useState(null as null | JSX.Element);
    const [prefs, setPrefs] = useState({} as CoursePreferences);

    if (search !== null) return (
        <BrowseView mySections={ps.mySections} goBack={() => setSearch(null)}
                    search={search} setSearch={setSearch}
        />
    );


    const courseLayouts = ps.mySections.order.map(c => c !== "Optional" ? c : (
        <Box key={"optional"} mb={2} mt={4}>
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
            <Stack alignItems="center">
                <Stack direction="row" alignItems="center" width="100%" spacing={2} py={2}>
                    <SearchBar label="Add desired courses" initial={search ?? ""} setSearch={setSearch} />
                    <Button variant="outlined" size="large"
                            sx={{ minWidth: "fit-content", height: "50px", p: 2 }}
                            onClick={(e) => setPopoverAnchor(e.target as any)}
                    >
                        Customize Preferences
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
                <Button variant="contained" size="large" onClick={() => ps.generate(prefs)}
                        sx={{ width: "fit-content", height: "60px", borderRadius: "30px", p: 3, px: 5, mt: 4 }}
                >
                    Generate Schedule
                </Button>

                <PreferencesPopup prefs={prefs} setPrefs={setPrefs}
                                   anchor={popoverAnchor} onClose={() => setPopoverAnchor(null)}
                />
            </Stack>
        </Stack>
    );
}
