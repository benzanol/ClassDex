import './App.css'
import './styles/calendar.css'
import './styles/grabber.css'

import { useEffect, useState } from 'react';
import { Box, Stack, Tabs, Tab } from '@mui/material/index'
import * as Resizer from '@column-resizer/react';
import Calendar from './components/views/Calendar';
import { Section } from './types';
import { getAll } from './utils/allCourses';
import { getLocalStorage, saveCourseOrder, saveSavedSchedules, saveSections } from './utils/localStorage';
import CurrentView from './components/views/CurrentView';
import { sectionsHook } from './utils/sectionsHook';
import { callAlgorithmAndUpdate } from "./utils/algorithm";

import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import ScheduleView from './components/views/ScheduleView';
import SavedView from './components/views/SavedView';


export const ALL = getAll();
const INITIAL = getLocalStorage(ALL.courses, ALL.sections);


export default function App() {
    // Which sections you have selected
    const [mySections, setMySections] = useState(INITIAL.sections);
    // The priority of your courses
    const [courseOrder, setCourseOrder] = useState(INITIAL.order);
    // List of saved schedules
    const [savedSchedules, setSavedSchedules] = useState(INITIAL.saved);

    // The schedule results from the algorithm
    const [sectionResults, setSectionResults] = useState([] as Section[]);

    // 0=Current, 1=Saved, 2=Edit
    const [appState, setAppState] = useState(0);


    // Save local data
    useEffect(() => saveSections(mySections), [mySections]);
    useEffect(() => saveSavedSchedules(savedSchedules), [savedSchedules]);
    useEffect(() => saveCourseOrder(courseOrder), [courseOrder]);


    // This will allow child modules to access and modify the section data
    const hook = sectionsHook(mySections, setMySections, courseOrder, setCourseOrder);

    const leftColumn = [
        <CurrentView mySections={hook}
                     generate={() => callAlgorithmAndUpdate(
                         mySections, courseOrder, {},
                         setSectionResults,
                     )}
        />,
        (sectionResults === null) ? <div>No schedule selected</div> : (
            <ScheduleView results={[ ...sectionResults ]} setResults={setSectionResults}
                          save={(name: string) => {
                              const match = name.match(/(.*)<([0-9]+)>/);
                              const nameBase = match ? match[1] : name;
                              let number = match ? +match[2] : 0;
                              while (savedSchedules.find(saved => saved.name === name)) {
                                  number += 1;
                                  name = `${nameBase}<${number}>`;
                              }
                              setSavedSchedules([
                                  ...savedSchedules,
                                  {
                                      name,
                                      time: new Date().toLocaleString(),
                                      sections: sectionResults.map(s => s.section.crn),
                                  },
                              ]);
                          }}
            />
        ),
        <SavedView saved={savedSchedules} setSaved={setSavedSchedules}
                   setResults={setSectionResults}
        />,
    ].map((layout, idx) => (
        <Box height="100%" hidden={appState !== idx}>{ layout }</Box>
    ));



    return (
        <Resizer.Container style={{ height: "100vh" }}>

            <Resizer.Section style={{ height: "100%" }} minSize={600} defaultSize={800}>
                <Stack justifyContent="space-between" height="100%">
                    <Box sx={{ p: 2, height: "100%", overflowY: "scroll" }}>{ leftColumn }</Box>
                    <Tabs variant="fullWidth" value={appState} onChange={(_, val) => setAppState(val)}>
                        <Tab icon={<SchoolIcon />} label="Desired Courses" />
                        <Tab icon={<CalendarMonthIcon />} label="View Schedule" />
                        <Tab icon={<BookmarksIcon />} label="Saved Schedules" />
                    </Tabs>
                </Stack>
            </Resizer.Section>

            <Resizer.Bar size={4} style={{ borderLeft: "1px solid darkgray", cursor: "col-resize" }} />

            <Resizer.Section minSize={400}>
                <Calendar sections={sectionResults} />
            </Resizer.Section>

        </Resizer.Container>
    );
}
