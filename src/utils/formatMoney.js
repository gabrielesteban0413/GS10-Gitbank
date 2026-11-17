export function formatMoney(amount) {
  return `$ ${amount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
