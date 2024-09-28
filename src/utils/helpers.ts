export const trimText = (text: string) => text?.trim();

export const toLowerCase = (text: string) => text?.toLowerCase();

export const trimAndLower = (text: string | null | undefined) => {
  // Ensure that text is a string before applying .toLowerCase() and .trim()
  return typeof text === 'string' ? text.toLowerCase().trim() : '';
};
