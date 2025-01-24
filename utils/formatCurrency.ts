export function formatCurrency(amount: string): string {
  const numericAmount = Number.parseFloat(amount.replace(/[^0-9.]/g, ""))
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

