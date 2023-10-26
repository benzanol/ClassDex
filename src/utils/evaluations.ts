import EVALUATIONS, { ClassEvalData } from "./evaluationData";

export function getEvals(courseId: string): {[s: string]: ClassEvalData} {
    return EVALUATIONS[courseId] ?? {};
}

