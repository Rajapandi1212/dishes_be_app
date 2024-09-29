import { ErrorData, FiltersData } from '../type';

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
