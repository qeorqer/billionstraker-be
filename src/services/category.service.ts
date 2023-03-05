import Category from '@models/Category.model';
import ApiError from '@exceptions/api-errors';
import { categoryType } from '@type/category.type';
import Transaction from '@models/Transaction.model';

export const getCategories = async (
  userId: string,
): Promise<categoryType[]> => {
  const categories = await Category.find({ ownerId: userId });

  if (!categories) {
    throw ApiError.ServerError('There is no categories');
  }

  const categoriesCounts: Array<{ name: string, count: number }> = await Promise.all(categories.map(async ({ name }) => {
    const count = await Transaction.find({
      category: name,
    }).countDocuments();

    return { name, count };
  }));

  categories.sort((a, b) => {
    const aCount = categoriesCounts.find((categoryCount) => categoryCount.name === a.name)?.count;
    const bCount = categoriesCounts.find((categoryCount) => categoryCount.name === b.name)?.count;

    if (aCount === undefined || bCount === undefined) {
      return 0;
    }

    return bCount - aCount;
  });

  return categories;
};

export const createCategory = async (
  category: categoryType,
  userId: string,
): Promise<categoryType> => {
  const isAlreadyExist = await Category.findOne({
    name: category.name,
    ownerId: userId,
    categoryType: category.categoryType,
  });

  if (isAlreadyExist) {
    throw ApiError.BadRequest(
      'Category with this name already belongs to user',
    );
  }

  const newCategory = await Category.create({
    ...category,
    ownerId: userId,
  });

  return newCategory;
};

export const updateCategory = async (
  categoryId: string,
  category: categoryType,
  userId: string,
): Promise<categoryType> => {
  const categoryForUpdate = await Category.findById(categoryId);

  if (!categoryForUpdate) {
    throw ApiError.BadRequest('There is no such category');
  }

  await Transaction.updateMany(
    {
      category: categoryForUpdate.name,
      ownerId: userId,
    },
    {
      category: category.name,
    },
  );

  categoryForUpdate.overwrite({ ...category });
  const updatedCategory = await categoryForUpdate.save();

  return updatedCategory;
};

export const deleteCategory = async (categoryId: string): Promise<string> => {
  const categoryToDelete = await Category.findById(categoryId);

  if (!categoryToDelete) {
    throw ApiError.BadRequest('There is no such category');
  }

  await categoryToDelete.remove();
  return categoryId;
};
