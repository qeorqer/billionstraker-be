import Balance from '@models/Balance.model';
import ApiError from '@exceptions/api-errors';
import { balanceType } from '@type/balance.type';
import Transaction from '@models/Transaction.model';

export const createBalance = async (
  name: string,
  amount: number | undefined,
  userId: string,
): Promise<balanceType> => {
  const balance = await Balance.findOne({ name, ownerId: userId });

  if (balance) {
    throw ApiError.BadRequest('Balance with this name already exists');
  }

  const newBalance = await Balance.create({
    name,
    amount,
    ownerId: userId,
  });

  return newBalance;
};

export const getBalances = async (userId: string): Promise<balanceType[]> => {
  const userBalances = await Balance.find({ ownerId: userId });

  if (userBalances.length) {
    const balancesCounts: Array<{ name: string, count: number }> = await Promise.all(userBalances.map(async ({ name }) => {
      const count = await Transaction.find({
        $or: [{balance: name}, {balanceToSubtract: name,}],
      }).countDocuments();

      return { name, count };
    }));

    userBalances.sort((a, b) => {
      const aCount = balancesCounts.find((balanceCount) => balanceCount.name === a.name)?.count;
      const bCount = balancesCounts.find((balanceCount) => balanceCount.name === b.name)?.count;

      if (aCount === undefined || bCount === undefined) {
        return 0;
      }

      return bCount - aCount;
    });

  }

  return userBalances;
};

export const updateBalance = async (
  balanceId: string,
  balance: balanceType,
  userId: string,
): Promise<balanceType> => {
  const balanceForUpdate = await Balance.findById(balanceId);

  if (!balanceForUpdate) {
    throw ApiError.BadRequest('There is no such balance');
  }

  await Transaction.updateMany(
    {
      balance: balanceForUpdate.name,
      ownerId: userId,
    },
    {
      balance: balance.name,
    },
  );

  balanceForUpdate.overwrite({ ...balance });
  const updatedBalance = await balanceForUpdate.save();

  return updatedBalance;
};

export const deleteBalance = async (balanceId: string): Promise<string> => {
  const balanceToDelete = await Balance.findById(balanceId);

  if (!balanceToDelete) {
    throw ApiError.BadRequest('There is no such balance');
  }

  await balanceToDelete.remove();
  return balanceId;
};
