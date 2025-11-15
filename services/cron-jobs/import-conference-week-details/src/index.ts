// Main entry point with error handling
import { log } from 'crawlee';
import { main } from './main.js';
import { config } from './config.js';
import { ConferenceWeekDetailModel, mongoConnect } from '@democracy-deutschland/bundestagio-common';
import type { IConferenceWeekDetail } from '@democracy-deutschland/bundestagio-common/dist/models/ConferenceWeekDetail/schema.js';
import type { UpdateQuery } from 'mongoose';
import { updateProcedureVoteDates } from './utils/update-vote-dates.js';

// Configure logging
log.setLevel(log.LEVELS.INFO);

export async function run(): Promise<void> {
  try {
    if (!config.runtime.isTest) {
      await mongoConnect(config.db.url);
    }

    // Run the crawler (now using JSON API)
    const results = await main();
    log.info('Fetched conference weeks:', { count: results.length });

    // if test return here
    if (config.runtime.isTest) {
      log.info('Test mode: Skipping MongoDB save');
      return;
    }

    log.info('Connected to MongoDB');

    // Save to MongoDB
    log.info('Saving conference weeks to MongoDB...');
    try {
      for (const conferenceWeek of results) {
        const data: UpdateQuery<IConferenceWeekDetail> = conferenceWeek;

        log.info('Saving conference week:', {
          week: data.thisWeek,
          year: data.thisYear,
          sessionCount: data.sessions?.length || 0,
        });

        await ConferenceWeekDetailModel.findOneAndUpdate({ id: data.id }, data, {
          upsert: true,
          new: true,
          runValidators: true,
        });

        log.info(`✅ Saved conference week ${data.thisYear}-${data.thisWeek} to database`);
      }

      log.info('Successfully saved all conference weeks to MongoDB');

      // Step 2: Update voteDate in procedures based on saved conference weeks
      log.info('🗳️  Updating voteDate in procedures from conference weeks...');
      try {
        const updateResult = await updateProcedureVoteDates();
        log.info(`✅ Successfully updated ${updateResult.modifiedCount} procedures with voteDates`);
      } catch (voteDateError) {
        log.error('⚠️  Error updating voteDates in procedures:', {
          message: voteDateError instanceof Error ? voteDateError.message : String(voteDateError),
        });
        // Continue execution - conference weeks are saved even if voteDate update fails
      }

      process.exit(0);
    } catch (dbError) {
      log.error('Error saving to MongoDB:', {
        message: dbError instanceof Error ? dbError.message : String(dbError),
      });
      // Don't exit process here to ensure we at least have the JSON file
    }
  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      // Network errors and other standard errors
      log.error('Error while importing conference week details (NETWORK_ERROR):', { message: error.message });
      log.error('Original error:', { error });
      process.exit(1);
    } else {
      // Unknown errors
      log.error('Error while importing conference week details (UNKNOWN_ERROR):', { error });
      process.exit(1);
    }
  }
}

// Run the crawler if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  void run();
}
