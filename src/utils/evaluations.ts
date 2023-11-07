import EVALUATIONS, { ClassEvalData } from "./evaluationData";

export function getEvals(courseId: string): {[s: string]: ClassEvalData} {
    const evals = EVALUATIONS[courseId] ?? {};
    for (let key in evals) {
        if (evals[key].grade.responses === 0) {
            delete evals[key];
        }
    }
    return evals;
}

