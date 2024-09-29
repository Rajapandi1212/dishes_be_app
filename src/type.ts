export type FiltersData = {
  isError: false;
  cookTimeLTE?: number;
  cookTimeGTE?: number;
  prepTimeLTE?: number;
  prepTimeGTE?: number;
  flavor?: string;
  course?: string;
  state?: string;
  region?: string;
  diet?: number;
};

export type ErrorData = {
  isError: true;
  message: string;
};
