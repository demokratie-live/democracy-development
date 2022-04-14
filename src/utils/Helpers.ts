import { find } from 'lodash-es';
import slug from 'slug';

import { AppConfig } from './AppConfig';

const subjectConfig = [...AppConfig.filters.subjectGroups.options];

/**
 * just a hacky dummy for getting correct data
 * @param term string
 * @returns string
 */
export const getImage = (term: string) => {
  const img =
    find(subjectConfig, {
      value: term,
    })?.image ?? 'bundestag';
  return `/img/categories/${img}.jpg`;
};

export const makeLink = ({ type, procedureId, title }: any) => {
  const t = title.split(' ').slice(0, 10).join(' ');
  return `/${slug(type)}/${procedureId}/${slug(t)}`;
};
