export function countActiveLicenses(user: any): number {
    let total = 0;
  
    user.rentals?.forEach((rental: any) => {
        total += rental.registrations?.length || 0;
    });
  
    return total;
}