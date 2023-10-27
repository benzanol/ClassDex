import { FormControl, InputLabel, MenuItem, Popover, Select, Stack, TextField } from "@mui/material";
import { CoursePreferences } from "../../types";

export default function PreferencesPopup(ps: {
    anchor: JSX.Element | null,
    onClose: () => void,
    prefs: CoursePreferences,
    setPrefs: (p: CoursePreferences) => void,
}) {

    return (
        <Popover
            open={Boolean(ps.anchor)}
            onClose={ps.onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            anchorEl={ps.anchor as any}
        >
            <Stack p={2} spacing={2}>
                <TextField label="Min Credits" value={ps.prefs.minCredits ?? ""}
                           onChange={(e) => {
                               const n = +e.target.value;
                               ps.setPrefs({ ...ps.prefs, minCredits: isFinite(n) ? n : undefined })
                           }}
                />
                <TextField label="Max Credits" value={ps.prefs.maxCredits ?? ""}
                           onChange={(e) => {
                               const n = +e.target.value;
                               ps.setPrefs({ ...ps.prefs, maxCredits: isFinite(n) ? n : undefined })
                           }}
                />
                <FormControl fullWidth>
                    <InputLabel id="time-preference-label">Time Preference</InputLabel>
                    <Select value={ps.prefs.time ?? undefined}
                            label="Time Preference"
                            labelId="time-preference-label"
                            onChange={(event) => {
                                ps.setPrefs({
                                    ...ps.prefs,
                                    time: event.target.value as any,
                                });
                            }}
                    >
                        <MenuItem value={undefined}>No Preference</MenuItem>
                        <MenuItem value={"early"}>Early</MenuItem>
                        <MenuItem value={"middle"}>Middle</MenuItem>
                        <MenuItem value={"late"}>Late</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        </Popover>
    )
}
