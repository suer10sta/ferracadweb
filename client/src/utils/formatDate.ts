export const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // If it's just a date string (YYYY-MM-DD), append time to avoid timezone shifts
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
};