// Message of a failed axios request, preferring the text sent by our API routes
export const errorMessage = (err: any): string => {
  const data = err?.response?.data;
  if (typeof data === 'string' && data) {
    return data;
  }
  return err?.message ?? String(err);
};
