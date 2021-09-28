import {Router} from 'express'
import authMiddleware from '../middlewares/auth.middleware'
import * as categoryController from '../controllers/category.controller'

const categoryRouter:Router = Router()

categoryRouter.get('/getCategories', authMiddleware, categoryController.getCategories)

export default categoryRouter