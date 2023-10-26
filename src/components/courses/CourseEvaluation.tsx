import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Stack, Typography } from "@mui/material";
import { Course } from "../../types";
import { getEvals } from "../../utils/evaluations";
import { ExpandMore } from "@mui/icons-material";


const averageEval = {
    organization: 1.75,
    assignments:  1.73,
    quality:      1.76,
    challenge:    1.68,
    workload:     2.85,
    satisfies:    2.25,
    grade:        1.29,
    pass:         1.34,
};
const averagePassFailPercent = 17.5;



const pointStyles = {
    position: "absolute",
    top: "-4px",
    borderRadius: "5px",
    width: "10px",
    height: "10px",
};

const currentPointColor = "#28C";
const averagePointColor = "#AAA";

const mostLeastStyle = {
    color: "#999",
    lineHeight: "1.2",
    fontSize: "0.86em",
    textAlign: "center",
};

function CourseEvaluationDatapoint(ps: {
    title: string,
    left: string, right: string,
    value: number, avg: number,
}) {
    const slider = (
        <Box position="relative" width="100%">
            <hr style={{ width: "100%", borderTop: "none", color: "gray" }} />
            <Box sx={{
                     ...pointStyles,
                     left: `calc(${100 * ps.avg}% - 5px)`,
                     backgroundColor: averagePointColor,
                 }}
            />
            <Box sx={{
                     ...pointStyles,
                     left: `calc(${100 * ps.value}% - 5px)`,
                     backgroundColor: currentPointColor,
                 }}
            />
        </Box>
    );

    return (
        <Grid item xs={6} minWidth="300px" width="100%">
            <Typography variant="h2" fontSize="1.2em" pb={1}>{ps.title}</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={mostLeastStyle}>{ps.left}</Typography>
                <Box width="100%">{slider}</Box>
                <Typography sx={mostLeastStyle}>{ps.right}</Typography>
            </Stack>
        </Grid>
    );
}


export default function CourseEvaluation(ps: { course: Course }) {
    const evals = Object.entries(getEvals(ps.course.id));
    if (evals.length === 0) return (
        <Typography variant="h2" fontSize="1.4em" textAlign="center" p={5}>
            No evaluations found for "{ps.course.name}"
        </Typography>
    );

    const evalLayouts = evals.map(([sectionId, e]) => {
        const ae = averageEval;
        const simpleDatapointLayouts = ([
            ["Organization", "Least", "Most", 6 - e.organization.class, 6 - ae.organization, 5],
            ["Quality", "Worst", "Best", 6 - e.quality.class, 6 - ae.quality, 5],
            ["Challenge", "Least", "Most", 6 - e.challenge.class, 6 - ae.challenge, 5],
            ["Workload", "Least", "Most", e.workload.class, ae.workload, 5],
        ] as const).map(([title, left, right, value, average]) => (
            <CourseEvaluationDatapoint title={`${title}: ${value.toString().substring(0, 4)} / 5`}
                                       value={value / 5}
                                       avg={average / 5}
                                       left={left} right={right}
            />
        ));

        const pfPercent = Math.round(100 * e.pass.responses / (e.pass.responses + e.grade.responses));
        const gradeLetter = ["A", "B", "C", "D", "F"][Math.round(e.grade.class) - 1];

        const legendPointStyle = {
            width: "10px",
            height: "10px",
            borderRadius: "5px",
            display: "inline-block",
            margin: "0 4px 0 12px",
        };

        return (
            <Accordion elevation={3}>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant="h2" fontSize="1.2em">
                        Section {sectionId} Evaluations
                        ({e.quality.responses} {e.quality.responses === 1 ? "Response" : "Responses"})
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        { simpleDatapointLayouts }
                        <CourseEvaluationDatapoint
                            title={`Average Grade: ${gradeLetter}`}
                            value={(5 - e.grade.class) / 4}
                            avg={(5 - ae.grade) / 4}
                            left="F" right="A"
                        />
                        <CourseEvaluationDatapoint
                            title={`Percent who chose pass/fail: ${Math.round(pfPercent)}%`}
                            value={pfPercent/100}
                            avg={averagePassFailPercent/100}
                            left="0%" right="100%"
                        />
                    </Grid>
                    <Typography fontSize="0.9em" color="gray" textAlign="right" mt={3}>
                        <Box sx={{ ...legendPointStyle, backgroundColor: currentPointColor }} />
                        This Class
                        <Box sx={{ ...legendPointStyle, backgroundColor: averagePointColor }} />
                        Average Rice Class
                    </Typography>
                </AccordionDetails>
            </Accordion>
        );
    });

    return <Box>{ evalLayouts }</Box>;
}
