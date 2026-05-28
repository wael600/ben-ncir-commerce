export function formatPrice(amount: number) {
    return `${amount.toFixed(3)} TND`;
}

const NUMBER_FORMATTER = new Intl.NumberFormat("fr-TN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export function formatNumber(amount: number): string {
    return NUMBER_FORMATTER.format(amount);
}