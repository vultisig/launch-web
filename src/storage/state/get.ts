export const getState = <T>(key: string, initialValue: T): T => {
  const value = localStorage.getItem(key);

  if (value === null) return initialValue;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
};
