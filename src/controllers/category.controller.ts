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
      message: 'Сategories loaded successfully',
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
      return next(ApiError.BadRequest('Category is required'));
    }

    const createdCategory = await categoryService.createCategory(
      category,
      userId,
    );

    return res.json({
      message: 'Category created successfully',
      category: createdCategory,
    });
  } catch (e) {
    next(e);
  }
};

export const updateCategory: ControllerFunction = async (req, res, next) => {
  try {
    const { categoryId, category } = req.body;
    const { userId } = req.body.user;

    if (!categoryId || !category) {
      return next(ApiError.BadRequest('CategoryId and category are required'));
    }

    const updatedCategory = await categoryService.updateCategory(
      categoryId,
      category,
      userId,
    );

    return res.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const deleteCategory: ControllerFunction = async (req, res, next) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return next(ApiError.BadRequest('CategoryId is required'));
    }

    const removedCategoryId = await categoryService.deleteCategory(categoryId);

    return res.json({
      message: 'Category deleted successfully',
      categoryId: removedCategoryId,
    });
  } catch (e) {
    next(e);
  }
};
