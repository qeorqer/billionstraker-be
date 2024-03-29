import { RangeStatisticsItem } from '@type/statistics.type';
import Decimal from 'decimal.js';

export const getCategoryStatisticsTotalValue = (range: RangeStatisticsItem[]) =>
  range.reduce(
    (prev, current) => Decimal.add(prev, current.amount).toNumber(),
    0,
  );
