import { NextFunction, Request, Response } from 'express'
import * as categoryService from '../services/category.service'

type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<Response | void>


export const getCategories: ControllerFunction = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories()
    return res.json({
      messageEn: 'Сategories loaded successfully',
      messageRu: 'Категории успешно загружены'
      , categories
    })
  } catch (e) {
    next(e)
  }
}