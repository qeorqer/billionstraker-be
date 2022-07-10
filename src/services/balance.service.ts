import Balance from '@models/Balance.model';
import ApiError from '@exceptions/api-errors';
import { balanceType } from '@types/balance.type';

export const createBalance = async (
  name: string,
  amount: number | undefined,
  userId: string,
): Promise<balanceType> => {
  const balance = await Balance.findOne({ name, ownerId: userId });

  if (balance) {
    throw ApiError.BadRequest('Balance with this name already exists', '');
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
  return userBalances;
};

export const updateBalance = async (
  balanceId: string,
  balance: balanceType,
): Promise<balanceType> => {
  const updatedBalance = await Balance.findByIdAndUpdate(
    balanceId,
    { ...balance },
    { new: true },
  );

  if (!updatedBalance) {
    throw ApiError.BadRequest('There is no such balance', '');
  }

  return updatedBalance;
};

export const deleteBalance = async (balanceId: string): Promise<string> => {
  const balanceToDelete = await Balance.findById(balanceId);

  if (!balanceToDelete) {
    throw ApiError.BadRequest('There is no such balance', '');
  }

  await balanceToDelete.remove();
  return balanceId;
};
