import Category from '../models/Category.model';
import ApiError from '../exceptions/api-errors';
import { categoryType } from '../types/category.type';

export const getCategories = async (): Promise<categoryType[]> => {
  const categories = await Category.find();

  if (!categories) {
    throw ApiError.ServerError('There is no categories', 'Нет категорий');
  }

  return categories;
};

export const createCategory = async (category: categoryType, userId: string): Promise<categoryType> => {
  const isAlreadyExist = await Category.findOne({ name: category.name, ownerId: userId });

  if (isAlreadyExist) {
    throw ApiError.BadRequest('Category with this name already belongs to user', '');
  }

  const newCategory = await Category.create({
    ...category,
    ownerId: userId,
  });

  return newCategory;
};
