import { atom, selector } from 'recoil';

const filterForTypeState = atom({
  key: 'filterForTypeState',
  default: [],
});
const filterForSubjectState = atom({
  key: 'filterForSubjectState',
  default: [],
});

const filterSizeState = selector({
  key: 'filterSizeState',
  get: ({ get }) => {
    const type = get(filterForTypeState);
    const subject = get(filterForSubjectState);

    return type.length + subject.length;
  },
});

const filterState = selector({
  key: 'filterState',
  get: ({ get }) => {
    const type = get(filterForTypeState);
    const subject = get(filterForSubjectState);

    return [...type, ...subject];
  },
});

const searchTermState = atom({
  key: 'searchTermState',
  default: '',
});

const searchActiveState = selector({
  key: 'searchActiveState',
  get: ({ get }) => {
    const term = get(searchTermState);

    return term?.length > 3 && term.trim() !== '';
  },
});

export {
  filterForTypeState,
  filterForSubjectState,
  filterSizeState,
  filterState,
  searchTermState,
  searchActiveState,
};
