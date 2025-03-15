// Main entry point with error handling
import { log } from 'crawlee';
import { main } from './main.js';
import { getResults } from './routes.js';
import { ConferenceWeekDetailModel, mongoConnect } from '@democracy-deutschland/bundestagio-common';

// Configure logging
log.setLevel(log.LEVELS.INFO);

export async function run(): Promise<void> {
  try {
    // Run the crawler
    await main();

    // Log the results
    const results = getResults();
    log.info('Fetched conference weeks:', results);

    // if test return here
    if (process.env.TEST) {
      log.info('Test mode: Skipping MongoDB save');
      return;
    }

    await mongoConnect(process.env.MONGO_URL || 'mongodb://localhost:27017/bundestagio');
    log.info('Connected to MongoDB');

    // Save to MongoDB
    log.info('Saving conference weeks to MongoDB...');
    try {
      console.log('Saving conference week to MongoDB...');
      for (const result of results) {
        const data = {
          id: `${result.year}-${result.week}`,
          URL: result.url,
          thisYear: result.year,
          thisWeek: result.week,
          previousYear: result.previousWeek?.year || null,
          previousWeek: result.previousWeek?.week || null,
          nextYear: result.nextWeek?.year || null,
          nextWeek: result.nextWeek?.week || null,
          sessions: result.sessions.map((session) => ({
            date: session.date ? new Date(session.date) : null,
            dateText: session.dateText,
            session: session.session,
            tops: session.tops.map((top) => ({
              time: top.time,
              top: top.top,
              heading: top.heading,
              article: top.article,
              topic: top.topic.map((t) => ({
                lines: t.lines,
                documents: t.documents,
                documentIds: t.documentIds || [],
                isVote: false,
                procedureIds: [],
              })),
              status: top.status.map((s) => ({
                line: s.lines.join(' '),
                documents: s.documents || [],
              })),
            })),
          })),
        };

        console.log('Data to save:', data.thisYear, data.thisWeek);
        await ConferenceWeekDetailModel.findOneAndUpdate(
          {
            URL: data.URL,
            thisYear: data.thisYear,
            thisWeek: data.thisWeek,
          },
          data,
          { upsert: true, new: true, runValidators: true },
        );

        log.info(`Saved conference week ${data.thisYear}-${data.thisWeek} to database`);
      }

      log.info('Successfully saved all conference weeks to MongoDB');
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
