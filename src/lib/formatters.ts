export function formatCurrency(amount: number, currency: string) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

export function getCurrencySymbol(currency: string) {
  switch (currency) {
    case 'PHP': return '₱'
    case 'USD': return '$'
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'SGD': return 'S$'
    default: return '$'
  }
}
