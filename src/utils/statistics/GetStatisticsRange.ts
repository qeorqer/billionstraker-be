import {
  GetStatisticsRangeOptions,
  RangeStatisticsItem,
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
      categoryRange: [],
      total: 0,
    };
  }

  if (balanceName) {
    const range = groupTransactionsByKey(transactions, 'category');
    const total = getCategoryStatisticsTotalValue(range);

    return {
      categoryRange: range,
      total,
    };
  }

  const groupedTransactionsByCategory = groupTransactionsByKey(
    transactions,
    'balance-category',
  );

  const groupedTransactionsByBalance = groupTransactionsByKey(
    transactions,
    'balance',
  );

  const groupedTransactionsByCategoryWithConvertedCurrency =
    await convertCurrencyForGroupedTransaction(
      groupedTransactionsByCategory,
      balances,
      user.preferredCurrency,
    );

  const groupedTransactionsByBalanceWithConvertedCurrency =
    await convertCurrencyForGroupedTransaction(
      groupedTransactionsByBalance,
      balances,
      user.preferredCurrency,
    );

  // @ts-ignore
  const filteredCategoryRange: RangeStatisticsItem[] =
    groupedTransactionsByCategoryWithConvertedCurrency.filter(Boolean);
  // @ts-ignore
  const filteredBalanceRange: RangeStatisticsItem[] =
    groupedTransactionsByBalanceWithConvertedCurrency.filter(Boolean);
  const total = getCategoryStatisticsTotalValue(filteredCategoryRange);

  return {
    categoryRange: filteredCategoryRange,
    balanceRange: filteredBalanceRange,
    total,
  };
};
