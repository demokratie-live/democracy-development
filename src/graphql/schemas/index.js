import { fileLoader, mergeTypes } from 'merge-graphql-schemas';
import path from 'path';
import _ from 'lodash';

const typesArray = _.uniq(fileLoader(path.join(__dirname, './**/*')));

export default mergeTypes(typesArray);
