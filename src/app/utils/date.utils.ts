export class DateUtils {
    static getDateInFuture(minutes: number): Date {
        const date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));

        return date;
    }
}