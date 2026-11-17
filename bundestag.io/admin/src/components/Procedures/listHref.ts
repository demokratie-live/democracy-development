/**
 * The to-do list with its last filters and sorting, so the link back from a
 * procedure returns to the same view. Storage can be blocked; then it is just /procedures.
 */
const KEY = 'todo-list-query';
export const LIST_PATH = '/procedures';

export const rememberListQuery = (search: string) => {
  try {
    sessionStorage.setItem(KEY, search);
  } catch {
    // private mode or blocked storage: the back link falls back to the plain list
  }
};

export const lastListHref = () => {
  try {
    const search = sessionStorage.getItem(KEY);
    return search ? `${LIST_PATH}?${search}` : LIST_PATH;
  } catch {
    return LIST_PATH;
  }
};
