import path from 'path';
import { fileLoader, mergeResolvers } from 'merge-graphql-schemas';

const resolversArray = fileLoader(path.join(__dirname, './'), { extensions: ['.js', '.ts'], ignoredExtensions: ['test', 'integ']});

export default mergeResolvers(resolversArray);
