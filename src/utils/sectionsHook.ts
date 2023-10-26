import { CourseOrder, Section } from "../types";
import { moveArrayItem } from "./dragAndDrop";


export function sectionsHook(
    sections: Section[], setSections: (s: Section[]) => void,
    order: CourseOrder, setOrder: (o: CourseOrder) => void,
) {
    return {
        sections, order,
        add: (...newSections: Section[]) => {
            for (let newSection of newSections) {
                if (!sections.includes(newSection)) sections.push(newSection);
                if (!order.includes(newSection.course)) order.push(newSection.course);
            }
            setOrder([...order]);
            setSections([...sections]);
        },
        remove: (...removeSections: Section[]) => {
            const newSections = sections.filter(s => !removeSections.includes(s));
            setOrder(order.filter(course => course === "Optional" || (
                newSections.find(section => section.course === course)
            )));
            setSections(newSections);
        },
        reorder: (start: number, end: number) => {
            const newOrder = [...order];
            moveArrayItem(newOrder, start, end);
            setOrder(newOrder);
        }
    };
}
