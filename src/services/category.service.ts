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
