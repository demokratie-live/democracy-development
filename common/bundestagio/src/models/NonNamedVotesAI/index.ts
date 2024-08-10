import mongoose from 'mongoose';
import NonNamedVotesAiSchema, { INonNamedVotesAi } from './schema';

export const NonNamedVotesAiModel = mongoose.model<INonNamedVotesAi>('NonNamedVotesAi', NonNamedVotesAiSchema);
export { NonNamedVotesAiSchema, INonNamedVotesAi };
