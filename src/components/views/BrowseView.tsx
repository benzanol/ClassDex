import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { Button, IconButton, TextField, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { ALL } from "../../App";
import { CurrentSectionData, Course } from "../../types";
import CourseList from "../courses/CourseList";
import FilterBrowsePopup, { satisfiesFilter } from "./FilterBrowsePopup";
import SearchBar from "./SearchBar";


// Return whether a course matches the given search term
function matchesSearch(search: string, course: Course): boolean {
    // Check if the id or name contains the term
    const searchTerms = search.split(" ");
    for (let term of searchTerms) {
        if (!JSON.stringify([
            course.name, course.id, ...course.sections.map(s => s.instructor)
        ]).toLowerCase().includes(term.toLowerCase())) {
            return false;
        }
    }
    return true;
}


export default function BrowseView(ps: {
    mySections: CurrentSectionData,
    search: string,
    setSearch: (s: string) => void,
    goBack: () => void
}) {
    const [filter, setFilter] = useState({});
    const [popoverAnchor, setPopoverAnchor] = useState(null as null | JSX.Element);

    const filteredCourses = ALL.courses.filter(course => (
        matchesSearch(ps.search, course) && satisfiesFilter(course, filter)
    ));

    return (
        <>
            <Stack direction="row" alignItems="center" spacing={2} py={2}>
                <IconButton aria-label="comment" onClick={ps.goBack}>
                    <ArrowBackIcon />
                </IconButton>

                <SearchBar initial={ps.search} setSearch={ps.setSearch} />

                <Button variant="contained" size="large"
                        onClick={(e) => setPopoverAnchor(e.target as any)}
                        sx={{ minWidth: "fit-content", height: "50px", p: 2 }}
                >
                    Add Filter
                </Button>

                <FilterBrowsePopup filter={filter} setFilter={setFilter}
                                   anchor={popoverAnchor} onClose={() => setPopoverAnchor(null)}
                />
            </Stack>

            <Stack alignItems="center" pb={4}>
                {
                    filteredCourses.length ? (
                        <CourseList courses={filteredCourses} mySections={ps.mySections} />
                    ) : (
                        <Typography variant="h2" fontSize="1.3em" mt={2}>No matches found</Typography>
                    )
                }
            </Stack>
        </>
    );
}
