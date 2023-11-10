import {
  GetStatisticsRangeOptions,
  CategoryStatistics,
  StatisticsForTransactionTypeResult,
} from '@type/statistics.type';
import { groupTransactionsByKey } from '@utils/statistics/groupTransactionsByKey';
import { getCategoryStatisticsTotalValue } from '@utils/statistics/getCategoryStatisticsTotalValue';
import { convertCurrencyForGroupedTransaction } from '@utils/statistics/convertCurrencyForGroupedTransaction';

export const getStatisticsRange = async ({
  transactions,
  user,
  balances,
  balanceName,
}: GetStatisticsRangeOptions): Promise<StatisticsForTransactionTypeResult> => {
  if (!transactions.length) {
    return {
      range: [],
      total: 0,
    };
  }

  if (balanceName) {
    const range = groupTransactionsByKey(transactions, 'category');
    const total = getCategoryStatisticsTotalValue(range);

    return {
      range,
      total,
    };
  }

  const groupedTransactions = groupTransactionsByKey(
    transactions,
    'balance-category',
  );

  const groupedTransactionsWithConvertedCurrency =
    await convertCurrencyForGroupedTransaction(
      groupedTransactions,
      balances,
      user.preferredCurrency,
    );

  // @ts-ignore
  const filteredValues: CategoryStatistics[] =
    groupedTransactionsWithConvertedCurrency.filter(Boolean);
  const total = getCategoryStatisticsTotalValue(filteredValues);

  return {
    range: filteredValues,
    total,
  };
};
