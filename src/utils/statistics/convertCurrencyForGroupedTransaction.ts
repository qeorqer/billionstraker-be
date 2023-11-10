import { CategoryStatistics } from '@type/statistics.type';
import { convertCurrency } from '@utils/statistics/convertCurrency';
import { Balance } from '@type/balance.type';

export const convertCurrencyForGroupedTransaction = async (
  groupedTransactions: CategoryStatistics[],
  balances: Balance[],
  preferredCurrency: string | null,
) =>
  Promise.all<CategoryStatistics | null>(
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
        name: category,
        amount: convertedTotalValue,
      };
    }),
  );
