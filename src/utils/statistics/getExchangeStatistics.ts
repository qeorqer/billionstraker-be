import { Transaction } from '@type/transaction.type';
import Decimal from 'decimal.js';

export const getExchangesStatistics = (
  transactions: Transaction[],
  sumField: 'sum' | 'sumToSubtract',
): number => {
  if (!transactions.length) {
    return 0;
  }

  return transactions.reduce(
    (acc, cur) => Decimal.add(acc, cur[sumField] || 0).toNumber(),
    0,
  );
};
