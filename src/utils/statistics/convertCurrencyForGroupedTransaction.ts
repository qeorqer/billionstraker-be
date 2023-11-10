import { RangeStatisticsItem } from '@type/statistics.type';
import { convertCurrency } from '@utils/statistics/convertCurrency';
import { Balance } from '@type/balance.type';

export const convertCurrencyForGroupedTransaction = async (
  groupedTransactions: RangeStatisticsItem[],
  balances: Balance[],
  preferredCurrency: string | null,
) =>
  Promise.all<RangeStatisticsItem | null>(
    groupedTransactions.map(async ({ name, amount }) => {
      const [balanceName, category] = name.split('-');
      const balance = balances.find(({ name }) => name === balanceName);

      if (!balance?.currency || !preferredCurrency) {
        return null;
      }

      const convertedTotalValue = await convertCurrency(
        preferredCurrency,
        balance.currency,
        amount,
      );

      return {
        name: category || balanceName,
        amount: convertedTotalValue,
      };
    }),
  );
