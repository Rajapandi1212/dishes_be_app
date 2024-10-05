import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { ErrorData, FiltersData } from '../type';

const { SALT_ROUNDS, SECRET, TOKENAGE = '5' } = process.env;

export const trimText = (text: string) =>
  typeof text === 'string' ? text?.trim() : '';

export const lowerCaseText = (text: string) =>
  typeof text === 'string' ? text?.toLowerCase() : '';

export const trimAndLower = (text: string | null | undefined) => {
  // Ensure that text is a string before applying .toLowerCase() and .trim()
  return typeof text === 'string' ? text.toLowerCase().trim() : '';
};

export const isTextNull = (text: string) =>
  typeof text === 'string' ? (text === '' ? null : text) : null;

export const extractFilters: (reQuery: any) => ErrorData | FiltersData = (
  reqQuery: any
) => {
  const { flavor, course, state, region, diet } = reqQuery;
  const errorResponse = {
    isError: true,
    message: 'Invalid Filter',
  };
  let cookTimeLTE;
  let cookTimeGTE;
  let prepTimeLTE;
  let prepTimeGTE;
  const ctLte = reqQuery?.['cookTime']?.['lte'];
  const ctGte = reqQuery?.['cookTime']?.['gte'];
  const ptLte = reqQuery?.['prepTime']?.['lte'];
  const ptGte = reqQuery?.['prepTime']?.['gte'];
  if (ctLte) {
    cookTimeLTE = parseInt(ctLte as string);
    if (!valiadateFiltersNumber(ctLte, cookTimeLTE)) {
      errorResponse.message = 'Invalid cooktime_lte';
      return errorResponse;
    }
  }
  if (ctGte) {
    cookTimeGTE = parseInt(ctGte as string);
    if (!valiadateFiltersNumber(ctGte, cookTimeGTE)) {
      errorResponse.message = 'Invalid cooktime_gte';
      return errorResponse;
    }
  }
  if (ptLte) {
    prepTimeLTE = parseInt(ptLte as string);
    if (!valiadateFiltersNumber(ptLte, prepTimeLTE)) {
      errorResponse.message = 'Invalid prepTime_lte';
      return errorResponse;
    }
  }
  if (ptGte) {
    prepTimeGTE = parseInt(ptGte as string);
    if (!valiadateFiltersNumber(ptGte, prepTimeGTE)) {
      errorResponse.message = 'Invalid prepTime_gte';
      return errorResponse;
    }
  }
  return {
    isError: false,
    cookTimeLTE,
    cookTimeGTE,
    prepTimeLTE,
    prepTimeGTE,
    flavor,
    course,
    state,
    region,
    diet: parseInt(diet),
  };
};

const valiadateFiltersNumber = (originalString: string, parsedNumber: any) =>
  originalString == parsedNumber;

export const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(parseInt(SALT_ROUNDS as string));
    const hashedPassword = await bcrypt.hash(password, salt);
    return {
      value: hashedPassword,
    };
  } catch (error) {
    console.error('Error while hasing password :', error);
    return { error };
  }
};

export const createToken = (payload: any) => {
  return jwt.sign(payload, SECRET as string, { expiresIn: getTokenAge() });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET as string);
  } catch (error) {
    console.log('Token verify error :', error);
    return undefined;
  }
};

export const getTokenAge = () => {
  try {
    return parseInt(TOKENAGE) * 24 * 60 * 60 * 1000;
  } catch (error) {
    return 3 * 24 * 60 * 60 * 1000;
  }
};
