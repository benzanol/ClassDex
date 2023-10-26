import { Clear as ClearIcon } from "@mui/icons-material";
import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, Paper, Stack, Typography } from "@mui/material";
import { SavedSchedule, Section } from "../../types";
import { ALL } from "../../App";
import * as DragAndDrop from "../../utils/dragAndDrop";
import { useEffect } from "react";


export default function SavedView(ps: {
    saved: SavedSchedule[],
    setSaved: (s: SavedSchedule[]) => void,
    setResults: (r: Section[]) => void,
}) {
    useEffect(() => {
        for (let div of Array.from(document.getElementsByClassName("saved-grabber-container"))) {
            const grabber = DragAndDrop.createGrabber((start, end) => {
                const newOrder = [...ps.saved];
                DragAndDrop.moveArrayItem(newOrder, start, end);
                console.log(newOrder, start, end);
                ps.setSaved(newOrder);
            });
            div.replaceChildren(grabber);
        }
    });

    const listItems = ps.saved.map(schedule => (
        <Paper elevation={3} sx={{ mr: 2, my: 2, p: 0, width: "100%", border: "1px solid gray" }}>
            <ListItem sx={{ p: 0 }} secondaryAction={
                          <IconButton onClick={() => {
                                          // TODO: Add stop propogation
                                          ps.setSaved(ps.saved.filter(s => s !== schedule))
                                      }}>
                              <ClearIcon />
                          </IconButton>
                      }
            >
                <ListItemButton sx={{ py: 2, pl: 2 }} onClick={() => ps.setResults(
                                    ALL.sections.filter(s => schedule.sections.includes(s.section.crn))
                                )}
                >
                    <ListItemIcon>
                        <div className="saved-grabber-container" style={{ fontSize: "1.5em" }}>
                            <span className="grabber">⠿</span>
                        </div>
                    </ListItemIcon>
                    <Stack>
                        <Stack direction="row" alignItems="center" spacing={3}>
                            <Typography variant="h2" fontSize="1.3em">{ schedule.name }</Typography>
                            <Typography variant="overline" fontSize="0.9em" color="#666">
                                (
                                { schedule.sections.length }
                                { schedule.sections.length === 1 ? " Class" : " Classes" }
                                )
                            </Typography>
                        </Stack>
                        <Typography variant="overline" fontSize="0.9em" color="#666">
                            Created { schedule.time }
                        </Typography>
                    </Stack>
                </ListItemButton>
            </ListItem>
        </Paper>
    ))

    return listItems.length ? <List className="drag-container">{ listItems }</List> : (
        <Typography variant="h2" pt={4} fontSize="1.7em" textAlign="center">
            You have no saved schedules
        </Typography>
    );
}
