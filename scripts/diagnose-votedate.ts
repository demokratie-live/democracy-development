import { mongoConnect, ProcedureModel, ConferenceWeekDetailModel } from '@democracy-deutschland/bundestagio-common';

/**
 * Diagnostic script to investigate voteDate population issue
 *
 * This script will:
 * 1. Check for procedures without voteDate in current period
 * 2. Check conference week details and their session dates
 * 3. Verify the linkage between procedures and conference weeks
 */

async function diagnose() {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/bundestagio';
    console.log(`Connecting to MongoDB: ${mongoUrl}`);
    await mongoConnect(mongoUrl);
    console.log('✓ Connected to MongoDB\n');

    // Get current period (21st legislative period)
    const currentPeriod = 21;

    // 1. Check procedures without voteDate
    console.log('=== CHECKING PROCEDURES WITHOUT VOTEDATE ===');
    const proceduresWithoutVoteDate = await ProcedureModel.find({
      period: currentPeriod,
      voteDate: { $exists: false },
    }).limit(10);

    console.log(`Found ${proceduresWithoutVoteDate.length} procedures without voteDate (showing first 10):`);
    proceduresWithoutVoteDate.forEach((proc) => {
      console.log(`  - ${proc.procedureId}: ${proc.title.substring(0, 60)}...`);
      console.log(`    currentStatus: ${proc.currentStatus}`);
      console.log(`    voteWeek: ${proc.voteWeek}, voteYear: ${proc.voteYear}`);
    });

    const totalWithoutVoteDate = await ProcedureModel.countDocuments({
      period: currentPeriod,
      voteDate: { $exists: false },
    });
    console.log(`\nTotal procedures without voteDate: ${totalWithoutVoteDate}\n`);

    // 2. Check procedures WITH voteDate
    console.log('=== CHECKING PROCEDURES WITH VOTEDATE ===');
    const proceduresWithVoteDate = await ProcedureModel.find({
      period: currentPeriod,
      voteDate: { $exists: true },
    })
      .limit(5)
      .sort({ voteDate: -1 });

    console.log(`Recent procedures with voteDate (showing 5):`);
    proceduresWithVoteDate.forEach((proc) => {
      console.log(`  - ${proc.procedureId}: ${proc.title.substring(0, 60)}...`);
      console.log(`    voteDate: ${proc.voteDate}`);
      console.log(`    voteWeek: ${proc.voteWeek}, voteYear: ${proc.voteYear}`);
    });

    const totalWithVoteDate = await ProcedureModel.countDocuments({
      period: currentPeriod,
      voteDate: { $exists: true },
    });
    console.log(`\nTotal procedures with voteDate: ${totalWithVoteDate}\n`);

    // 3. Check conference week details
    console.log('=== CHECKING CONFERENCE WEEK DETAILS ===');
    const currentYear = new Date().getFullYear();
    const recentConferenceWeeks = await ConferenceWeekDetailModel.find({
      thisYear: { $gte: currentYear - 1 },
    })
      .sort({ thisYear: -1, thisWeek: -1 })
      .limit(5);

    console.log(`Recent conference weeks (showing 5):`);
    recentConferenceWeeks.forEach((cw) => {
      console.log(`  - ${cw.thisYear}-W${cw.thisWeek}`);
      console.log(`    Sessions: ${cw.sessions?.length || 0}`);
      if (cw.sessions && cw.sessions.length > 0) {
        cw.sessions.forEach((session: any) => {
          console.log(`      Session ${session.session}: ${session.date}`);
          const topCount = session.tops?.length || 0;
          let voteCount = 0;
          let procedureIdCount = 0;

          session.tops?.forEach((top: any) => {
            top.topic?.forEach((t: any) => {
              if (t.isVote) voteCount++;
              if (t.procedureIds && t.procedureIds.length > 0) {
                procedureIdCount += t.procedureIds.length;
              }
            });
          });

          console.log(`        TOPs: ${topCount}, Votes: ${voteCount}, Procedure IDs: ${procedureIdCount}`);
        });
      }
    });

    // 4. Check a specific procedure and its conference week linkage
    console.log('\n=== CHECKING PROCEDURE-CONFERENCE WEEK LINKAGE ===');
    if (proceduresWithoutVoteDate.length > 0) {
      const sampleProc = proceduresWithoutVoteDate[0];
      console.log(`Checking procedure: ${sampleProc.procedureId}`);

      // Find conference weeks that reference this procedure
      const linkedWeeks = await ConferenceWeekDetailModel.find({
        'sessions.tops.topic.procedureIds': sampleProc.procedureId,
      });

      console.log(`  Found ${linkedWeeks.length} conference weeks linking to this procedure`);
      linkedWeeks.forEach((cw) => {
        console.log(`    - ${cw.thisYear}-W${cw.thisWeek}`);
      });

      if (sampleProc.importantDocuments && sampleProc.importantDocuments.length > 0) {
        console.log(`  Important documents:`);
        sampleProc.importantDocuments.slice(0, 3).forEach((doc: any) => {
          console.log(`    - ${doc.type}: ${doc.url}`);
        });
      }
    }

    console.log('\n=== DIAGNOSIS COMPLETE ===');
    process.exit(0);
  } catch (error) {
    console.error('Error during diagnosis:', error);
    process.exit(1);
  }
}

diagnose();
