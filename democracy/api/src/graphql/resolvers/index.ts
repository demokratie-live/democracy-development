import path from 'path';
import { fileLoader, mergeResolvers } from 'merge-graphql-schemas';

const resolversArray = fileLoader(path.join(__dirname, './'), { extensions: ['.js', '.ts'] });

export default mergeResolvers(resolversArray);
