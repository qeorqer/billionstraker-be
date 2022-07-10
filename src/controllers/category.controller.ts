import { NextFunction, Request, Response } from 'express';

import * as categoryService from '@services/category.service';
import ApiError from '@exceptions/api-errors';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const getCategories: ControllerFunction = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const categories = await categoryService.getCategories(userId);
    return res.json({
      messageEn: 'Сategories loaded successfully',
      messageRu: '',
      categories,
    });
  } catch (e) {
    next(e);
  }
};

export const createCategory: ControllerFunction = async (req, res, next) => {
  try {
    const { category } = req.body;
    const { userId } = req.body.user;

    if (!category) {
      return next(ApiError.BadRequest('Category is required', ''));
    }

    const createdCategory = await categoryService.createCategory(
      category,
      userId,
    );

    return res.json({
      messageEn: 'Category created successfully',
      messageRu: '',
      category: createdCategory,
    });
  } catch (e) {
    next(e);
  }
};

export const updateCategory: ControllerFunction = async (req, res, next) => {
  try {
    const { categoryId, category } = req.body;

    if (!categoryId || !category) {
      return next(
        ApiError.BadRequest('CategoryId and category are required', ''),
      );
    }

    const updatedCategory = await categoryService.updateCategory(
      categoryId,
      category,
    );

    return res.json({
      messageEn: 'Category updated successfully',
      messageRu: '',
      category: updatedCategory,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteCategory: ControllerFunction = async (req, res, next) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return next(ApiError.BadRequest('CategoryId is required', ''));
    }

    const removedCategoryId = await categoryService.deleteCategory(categoryId);

    return res.json({
      messageEn: 'Category deleted successfully',
      messageRu: '',
      categoryId: removedCategoryId,
    });
  } catch (e) {
    next(e);
  }
};
