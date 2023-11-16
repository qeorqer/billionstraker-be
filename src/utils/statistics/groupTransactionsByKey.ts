import { Transaction } from '@type/transaction.type';
import Decimal from 'decimal.js';

export const groupTransactionsByKey = (
  transactions: Transaction[],
  key: 'category' | 'balance-category' | 'balance',
) => {
  const groupedTransactions: {
    [key: string]: number;
  } = {};

  transactions.forEach((balance) => {
    const groupKey = key
      .split('-')
      .map((balanceKey) => balance[balanceKey as keyof typeof balance])
      .join('-');

    if (groupedTransactions[groupKey]) {
      groupedTransactions[groupKey] = Decimal.add(
        groupedTransactions[groupKey],
        balance.sum,
      ).toNumber();
    } else {
      groupedTransactions[groupKey] = balance.sum;
    }
  });

  return Object.keys(groupedTransactions)
    .map((key) => ({
      name: key,
      amount: groupedTransactions[key],
    }))
    .sort((a, b) => b.amount - a.amount);
};
