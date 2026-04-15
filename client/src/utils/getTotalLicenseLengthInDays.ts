export function getTotalLicenseLengthInDays(user: any): number {
    let totalDays = 0;
  
    user.rentals?.forEach((rental: any) => {
      rental.registrations?.forEach((reg: any) => {
        const start = new Date(reg.createdAt);
        const end = new Date(reg.expirationDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
      });
    });
  
    return totalDays;
}