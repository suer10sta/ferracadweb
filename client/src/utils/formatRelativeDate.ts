export function formatRelativeDate(dateString: string | number | Date) {
    const targetDate = new Date(dateString);
    const today = new Date();
  
    // Clear time parts
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
  
    // Calculate difference in months
    const diffInMonths =
      (targetDate.getFullYear() - today.getFullYear()) * 12 +
      (targetDate.getMonth() - today.getMonth());
  
    // Format date as "19 déc 2025" (French)
    const formattedDate = targetDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  
    // Return string based on whether date is in future or past
    if (diffInMonths > 0) {
      return `Dans ${diffInMonths} mois (${formattedDate})`;
    } else if (diffInMonths < 0) {
      return `Il y a ${Math.abs(diffInMonths)} mois (${formattedDate})`;
    } else {
      return `Ce mois-ci (${formattedDate})`;
    }
}  