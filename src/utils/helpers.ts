export const trimText = (text: string) =>
  typeof text === 'string' ? text?.trim() : '';

export const toLowerCase = (text: string) =>
  typeof text === 'string' ? text?.toLowerCase() : '';

export const trimAndLower = (text: string | null | undefined) => {
  // Ensure that text is a string before applying .toLowerCase() and .trim()
  return typeof text === 'string' ? text.toLowerCase().trim() : '';
};

export const isTextNull = (text: string) =>
  typeof text === 'string' ? (text === '' ? null : text) : null;
