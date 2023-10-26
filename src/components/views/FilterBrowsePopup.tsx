import { Box, Checkbox, FormControlLabel, Popover, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Course } from "../../types";

export type CourseFilter = Partial<{
    d1: boolean,
    d2: boolean,
    d3: boolean,
    ad: boolean,
}>;

export function satisfiesFilter(course: Course, filter: CourseFilter): boolean {
    if (filter.d1 && course.satisfiesDistribution !== `Distribution Group I`) {
        return false;
    } else if (filter.d2 && course.satisfiesDistribution !== `Distribution Group II`) {
        return false;
    } else if (filter.d3 && course.satisfiesDistribution !== `Distribution Group III`) {
        return false;
    } else if (filter.ad && !course.analyzingDiversity) {
        return false;
    }
    return true;
}

export default function FilterBrowsePopup(ps: {
    anchor: JSX.Element | null,
    filter: CourseFilter,
    setFilter: (f: CourseFilter) => void,
    onClose: () => void,
}) {

    const checkboxes = [
        ["d1", "Distribution 1"],
        ["d2", "Distribution 2"],
        ["d3", "Distribution 3"],
        ["ad", "Analyzing Diversity"],
    ].map(([key, label]) => (
        <FormControlLabel
            label={label}
            control = {
                <Checkbox onChange={e => {
                              const newFilter = { ...ps.filter };
                              newFilter[key as keyof CourseFilter] = e.target.checked;
                              ps.setFilter(newFilter);
                          }}
                          checked={ps.filter[key]}
                />
            }
        />
    ));

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
            <Stack p={1} pr={3}>{ checkboxes }</Stack>
        </Popover>
    )
}
