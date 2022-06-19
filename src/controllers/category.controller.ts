import { NextFunction, Request, Response } from 'express';

import * as categoryService from '../services/category.service';
import ApiError from '../exceptions/api-errors';

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const getCategories: ControllerFunction = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    return res.json({
      messageEn: 'Сategories loaded successfully',
      messageRu: 'Категории успешно загружены',
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

    const createdCategory = await categoryService.createCategory(category, userId);
    return res.json({
      messageEn: 'Category created successfully',
      messageRu: '',
      category: createdCategory,
    });
  } catch (e) {
    next(e);
  }
};
