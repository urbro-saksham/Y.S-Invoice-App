export function formatInr(value) {
  const num = Number(value || 0)
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
