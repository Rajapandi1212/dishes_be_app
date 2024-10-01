import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { executeQuery } from '../utils/query';
import {
  createToken,
  getTokenAge,
  hashPassword,
  trimText,
  validateEmail,
} from '../utils/helpers';

// export const register = async (req: Request, res: Response) => {
//     try {
//         const response = await executeQuery(query);
//     cache.set(cacheKey, response);
//     res.status(200).json(response);
//     return;
//     } catch (error: any) {
//     const message = error?.message || 'Error occured';
//     console.error(message, error);
//     res.status(400).json({ success: false, message, error });
//     return;
//     }
// }

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req?.body;
    if (
      !name ||
      !email ||
      !password ||
      trimText(name)?.length < 3 ||
      trimText(password)?.length < 6
    ) {
      res
        .status(400)
        .json({ success: false, message: 'Please check your payload!!' });
      return;
    }

    if (!validateEmail(trimText(email))) {
      res
        .status(400)
        .json({ success: false, message: 'Please check your email!!' });
      return;
    }
    const hashedPassword = await hashPassword(trimText(password));
    if (!hashedPassword?.value) {
      res.status(400).json({
        success: false,
        message: 'Failed while processing password!!',
        state: 're_register',
      });
      return;
    }
    const query = `
INSERT INTO users (name,email,password)
VALUES ($1,$2,$3)
`;
    const response = await executeQuery(query, [
      trimText(name),
      trimText(email),
      hashedPassword?.value,
    ]);
    res.status(200).json(response);
    return;
  } catch (error: any) {
    const message = error?.message || 'Error occured';
    console.error(message, error);
    res.status(400).json({ success: false, message, error });
    return;
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req?.body;
    if (!email || !password || trimText(password)?.length < 6) {
      res
        .status(400)
        .json({ success: false, message: 'Please check your payload!!' });
      return;
    }
    const query = `
      SELECT * FROM users
      WHERE email = $1
      LIMIT 1;
      `;
    const user: any = await executeQuery(query, [email])?.then(
      (res) => res?.data?.[0]
    );
    if (user?.email === email) {
      const isPasswordMatch = await bcrypt.compare(password, user?.password);
      if (isPasswordMatch) {
        const userPayload = { id: user?.id, email: user?.email };
        const token = createToken(userPayload);
        res.cookie('user_session', token, {
          httpOnly: false, // False for now due to development
          maxAge: getTokenAge(),
        });
        res.status(200).json({ success: true, user: userPayload });
        return;
      } else {
        res
          .status(401)
          .json({ success: false, message: "Password doesn't match" });
        return;
      }
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
  } catch (error: any) {
    const message = error?.message || 'Error occured';
    console.error(message, error);
    res.status(400).json({ success: false, message, error });
    return;
  }
};
