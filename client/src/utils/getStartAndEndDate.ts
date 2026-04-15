export function getStartAndEndDate(duration: number, startDate: string | number | Date) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);
  
    return {
      startDate: start?.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }
  