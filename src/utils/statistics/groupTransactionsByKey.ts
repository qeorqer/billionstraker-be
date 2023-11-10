import { Transaction } from '@type/transaction.type';
import Decimal from 'decimal.js';

export const groupTransactionsByKey = (
  transactions: Transaction[],
  key: 'category' | 'balance-category',
) => {
  const groupedTransactions: {
    [key: string]: number;
  } = {};

  transactions.forEach((balance) => {
    const groupKey = key
      .split('-')
      .reduce((acc, cur) => (acc += balance[cur as keyof typeof balance]), '');

    if (groupedTransactions[groupKey]) {
      groupedTransactions[groupKey] = Decimal.add(
        groupedTransactions[groupKey],
        balance.sum,
      ).toNumber();
    } else {
      groupedTransactions[groupKey] = balance.sum;
    }
  });

  return Object.keys(groupedTransactions).map((key) => ({
    name: key,
    amount: groupedTransactions[key],
  }));
};
