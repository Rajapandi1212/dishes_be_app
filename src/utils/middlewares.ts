import { NextFunction, Request, Response } from 'express';
import { verifyToken } from './helpers';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req?.cookies?.user_session;
    if (token) {
      const decodedToken = verifyToken(token);
      if (decodedToken) {
        next();
      } else {
        res.status(401).json({
          success: false,
          messgae: 'Token expired',
          sessionExpired: true,
        });
        return;
      }
    } else {
      res.status(401).json({
        success: false,
        messgae: 'Token Not found',
        sessionExpired: true,
      });
      return;
    }
  } catch (error) {
    console.log('Auth Middleware error :', error);
    res
      .status(500)
      .json({ success: false, messgae: 'Somenthing wend wrong', error });
    return;
  }
};
