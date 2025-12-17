// Format number with thousands separator (XAF style)
export function formatMontant(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

// Format as currency
export function formatXAF(value: number): string {
  return `${formatMontant(value)} XAF`;
}

// Format percentage
export function formatPourcentage(value: number): string {
  return `${value.toFixed(1)} %`;
}

// Format months to readable text
export function formatDuree(months: number): string {
  if (months < 12) {
    return `${months} mois`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} an${years > 1 ? 's' : ''}`;
  }
  return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`;
}

// Calculate mensualité with optional différé
export function calculerMensualite(
  montant: number,
  tauxAnnuel: number,
  dureeMois: number,
  differeMois: number = 0
): number {
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const dureeEffective = dureeMois - differeMois;
  
  if (dureeEffective <= 0) return 0;
  if (tauxMensuel === 0) return montant / dureeEffective;
  
  // Interest capitalized during différé
  const montantCapitalise = montant * Math.pow(1 + tauxMensuel, differeMois);
  
  // Standard amortization formula
  const mensualite = montantCapitalise * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeEffective)) / 
                     (Math.pow(1 + tauxMensuel, dureeEffective) - 1);
  
  return Math.round(mensualite);
}

// Calculate total cost
export function calculerCoutTotal(mensualite: number, dureeMois: number, differeMois: number = 0): number {
  return mensualite * (dureeMois - differeMois);
}

// Format date
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Get initials from name
export function getInitials(nom: string, prenom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}
