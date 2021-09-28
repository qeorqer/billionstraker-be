import {Router} from 'express'
import authMiddleware from '../middlewares/auth.middleware'
import * as transactionController from '../controllers/transaction.controller'

const transactionRouter:Router = Router()

transactionRouter.post('/addNewTransaction',authMiddleware, transactionController.addTransaction)

transactionRouter.post('/getAllUserTransactions', authMiddleware, transactionController.getUserTransactions)

export default transactionRouter