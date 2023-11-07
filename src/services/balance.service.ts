import BalanceModel from '@models/Balance.model';
import ApiError from '@exceptions/api-errors';
import { Balance } from '@type/balance.type';
import Transaction from '@models/Transaction.model';
import { Types } from 'mongoose';

export const createBalance = async ({
  balance,
  userId,
}: {
  balance: Partial<Balance>;
  userId: Types.ObjectId;
}): Promise<Balance> => {
  const isAlreadyExist = await BalanceModel.findOne({
    name: balance.name!,
    ownerId: userId,
  });

  if (isAlreadyExist) {
    throw ApiError.BadRequest('Balance with this name already exists');
  }

  const newBalance = await BalanceModel.create({
    ...balance,
    ownerId: userId,
  });

  return newBalance;
};

export const getBalances = async (
  userId: Types.ObjectId,
): Promise<Balance[]> => {
  const userBalances = await BalanceModel.find({ ownerId: userId });

  if (userBalances.length) {
    // Sort balances to show the most used first

    const balancesCounts: Array<{ name: string; count: number }> =
      await Promise.all(
        userBalances.map(async ({ name }) => {
          const count = await Transaction.find({
            $or: [{ balance: name }, { balanceToSubtract: name }],
          }).countDocuments();

          return { name, count };
        }),
      );

    userBalances.sort((a, b) => {
      const aCount = balancesCounts.find(
        (balanceCount) => balanceCount.name === a.name,
      )?.count;
      const bCount = balancesCounts.find(
        (balanceCount) => balanceCount.name === b.name,
      )?.count;

      if (aCount === undefined || bCount === undefined) {
        return 0;
      }

      return bCount - aCount;
    });
  }

  return userBalances;
};

export const updateBalance = async ({
  balance,
  userId,
}: {
  balance: Balance;
  userId: Types.ObjectId;
}): Promise<Balance> => {
  const balanceForUpdate = await BalanceModel.findById(balance._id);

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

export const deleteBalance = async (
  balanceId: Types.ObjectId,
): Promise<Types.ObjectId> => {
  const balanceToDelete = await BalanceModel.findById(balanceId);

  if (!balanceToDelete) {
    throw ApiError.BadRequest('There is no such balance');
  }

  await balanceToDelete.remove();
  return balanceId;
};
