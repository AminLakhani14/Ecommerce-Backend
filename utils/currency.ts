const usd = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', currencyDisplay: 'code',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
export const formatUSD = (amount: number | string) => usd.format(Number(amount));
