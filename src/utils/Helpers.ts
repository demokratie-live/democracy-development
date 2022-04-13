import { find } from 'lodash-es';
import slug from 'slug';

import { AppConfig } from './AppConfig';

/**
 * just a hacky dummy for getting correct data
 * @param term string
 * @returns string
 */
export const getImage = (term: string) => {
  const img = find(AppConfig.filters.subjectGroups.options, {
    value: term,
  })!.image;
  return `https://democracy-app.de${img}_648.jpg`;
};

export const makeLink = ({ type, procedureId, title }: any) => {
  const t = title.split(' ').slice(0, 10).join(' ');
  return `/${slug(type)}/${procedureId}/${slug(t)}`;
};
