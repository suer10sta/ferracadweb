export function getTotalLicenseDays(start: string | Date, end: string | Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Calculate difference in milliseconds
    const diffInMs = endDate.getTime() - startDate.getTime();
  
    // Convert to days and add 1 to make it inclusive
    const totalDays = diffInMs / (1000 * 60 * 60 * 24) + 1;
  
    return Math.round(totalDays);
}