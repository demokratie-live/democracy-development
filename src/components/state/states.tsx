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

export {
  filterForTypeState,
  filterForSubjectState,
  filterSizeState,
  filterState,
};
