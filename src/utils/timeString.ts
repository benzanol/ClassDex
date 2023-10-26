export function timeString(hour: number, minute: number): string {
    const pm = hour >= 12;
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    const str = `${hour}`.padStart(2, "0") + ":" + `${minute}`.padStart(2, "0") + (pm ? "PM" : "AM");
    return str;
}
