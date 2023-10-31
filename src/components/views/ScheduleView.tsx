import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { CurrentSectionData, Section } from "../../types";
import { sectionChronologicalOrder } from "../../utils/allCourses";
import { addOrRemoveSectionButton } from "../courses/CourseHeaderLayout";
import SectionTimeLayout from "../courses/SectionTimeLayout";
import BrowseView from "./BrowseView";
import SearchBar from "./SearchBar";


export default function ScheduleView(ps: {
    results: Section[],
    setResults: (sections: Section[]) => void,
    save: (name: string) => void,
}) {
    // The current search term
    const [search, setSearch] = useState(null as null | string);

    if (ps.results.length === 0) return (
        <Typography variant="h2" pt={4} fontSize="1.7em" textAlign="center">
            No schedule selected
        </Typography>
    );

    const resultsHook: CurrentSectionData = {
        sections: ps.results,
        order: [],
        add: (...newSections: Section[]) => {
            for (let s of newSections) {
                if (!ps.results.includes(s)) ps.setResults([...ps.results, s]);
            }
        },
        remove: (...sections: Section[]) => {
            ps.setResults(ps.results.filter(s => !sections.includes(s)));
        },
        reorder: () => {},
    };

    if (search !== null) return (
        <BrowseView mySections={resultsHook} goBack={() => setSearch(null)}
                    search={search} setSearch={setSearch}
        />
    );

    const sectionLayouts = sectionChronologicalOrder(ps.results).map(section => (
        <Paper key={section.section.crn} sx={{ my: 1, p: 2 }} elevation={3}>
            <Stack direction="row" justifyContent="space-between">
                <Stack>
                    <Stack direction="row" alignItems="center" spacing={2} my={1}>
                        <Typography variant="overline" sx={{ fontSize: "0.8em" }} >
                            {section.course.id}
                        </Typography>
                        <Typography fontSize="1.15em">{section.course.shortName}</Typography>
                        <Typography variant="overline" sx={{ fontSize: "0.8em" }} >
                            ({section.course.creditHours} Credits)
                        </Typography>
                    </Stack>
                    <SectionTimeLayout section={section} />
                </Stack>
                {addOrRemoveSectionButton(false, [section], resultsHook)}
            </Stack>
        </Paper>
    ));

    return (
        <>
            <Stack direction="row" alignItems="center" spacing={2} py={2}>
                <SearchBar label="Manually Add Courses" initial={search ?? ""} setSearch={setSearch} />
                <Button variant="outlined" size="large"
                        sx={{ minWidth: "fit-content", height: "50px", p: 2 }}
                        onClick={() => ps.save(prompt("Name your schedule:") || "Untitled")}
                >
                    Save
                </Button>
            </Stack>
            <Box>{sectionLayouts}</Box>
            <Typography variant="h2" fontSize="1.35em" textAlign="center" pt={2}>
                Total Credit Hours: {ps.results.reduce((acc, sec) => sec.course.creditHours + acc, 0)}
            </Typography>
        </>
    )
}
