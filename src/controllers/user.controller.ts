import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import * as authService from '../services/user.service'
import ApiError from "../exceptions/api-errors"

type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<Response | void>

export const signUp: ControllerFunction = async (req, res, next) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest('There are validation errors', 'Ошибки валидации'))
    }

    const { login, password }: { login: string, password: string } = req.body

    await authService.signUp(login, password)

    return res.status(201).json({
      messageEn: 'User created successfully',
      messageRu: 'Пользователь успешно зарегестрирован',
    })
  } catch (e) {
    next(e)
  }
}

export const logIn: ControllerFunction = async (req, res, next) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest('There are validation errors', 'Ошибки валидации'))
    }

    const { login, password }: { login: string, password: string } = req.body

    const logInRes = await authService.logIn(login, password)

    res.cookie('refreshToken', logInRes.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure:true, sameSite:'none'})
    return res.json(logInRes)
  } catch (e) {
    next(e)
  }
}

export const logOut: ControllerFunction = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies
    const logOutRes = await authService.logOut(refreshToken)

    return res.status(200).json({ 'deletedToken': logOutRes.refreshToken })
  } catch (e) {
    next(e)
  }
}

export const refresh: ControllerFunction = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies
    const refreshRes = await authService.refresh(refreshToken)

    res.cookie('refreshToken', refreshRes.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure:true, sameSite:'none' })
    return res.json(refreshRes)
  } catch (e) {
    next(e)
  }
}

export const setFirstEnter: ControllerFunction = async (req, res, next) => {
  try {
    const { id: userId } = req.body.user

    const user = await authService.setFirstEnter(userId)

    return res.status(201).json({
      messageEn: 'isFirstEnter set to false',
      messageRu: 'isFirstEnter поставлен в значение false',
      user
    })
  } catch (e) {
    next(e)
  }
}

export const setInitialValues: ControllerFunction = async (req, res, next) => {
  try {
    const { id: userId } = req.body.user
    const { card, cash }: { card: number, cash: number } = req.body

    const user = await authService.setInitialValues(userId, card, cash)

    return res.status(201).json({
      messageEn: 'initial values where set successfully',
      messageRu: 'Стартовые значения успешно установлены',
      user
    })
  } catch (e) {
    next(e)
  }
}