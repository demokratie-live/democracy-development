import { formatVotes } from '@/utils/Helpers';

import DoughnutChart from '../organisms/DoughnutChart';

export default function ChartPair({ item, className, large }) {
  const sizes = large ? '!w-32 !h-32 md:!w-40 md:!h-40' : '!w-28 !h-28';
  return (
    <div className={className}>
      {item.voteResults && (
        <div className="flex flex-col items-center">
          <DoughnutChart
            votes={{
              yes: {
                label: 'Ja',
                color: '#708E32',
                count: item.voteResults.yes,
              },
              no: {
                label: 'Nein',
                color: '#C34091',
                count: item.voteResults.no,
              },
              abstination: {
                label: 'Enthalten',
                color: '#6BAAD0',
                count: item.voteResults.abstination,
              },
              notVoted: item.voteResults.notVoted
                ? {
                    label: 'Nicht abgestimmt',
                    color: '#B1B3B4',
                    count: item.voteResults.notVoted,
                  }
                : undefined,
            }}
            className={`rounded-full bg-white p-0.5 ${sizes}`}
          />
          <p className="flex flex-col items-center pb-1 pt-px text-xs leading-[1.1em]">
            <span className="font-bold">Bundestag</span>
            <span className="text-sm font-semibold tracking-wide">
              <small>
                {item.voteResults.namedVote
                  ? `${formatVotes(
                      item.voteResults.yes + item.voteResults.no
                    )} Abgeordnete`
                  : `${item.voteResults.partyVotes.length} Fraktionen`}
              </small>
            </span>
          </p>
        </div>
      )}
      <div className="flex flex-col items-center">
        <DoughnutChart
          className={`rounded-full bg-white p-0.5 ${sizes}`}
          votes={{
            yes: {
              label: 'Ja',
              color: '#46A058',
              count: item.communityVotes.yes,
            },
            no: {
              label: 'Nein',
              color: '#B83829',
              count: item.communityVotes.no,
            },
            abstination: {
              label: 'Enthalten',
              color: '#4580DD',
              count: item.communityVotes.abstination,
            },
          }}
        />
        <p className="flex flex-col items-center pb-1 pt-px text-xs leading-[1.1em]">
          <span className="font-bold">Community</span>
          <span className="text-sm font-semibold tracking-wide">
            <small>{formatVotes(item.votes)}</small>
          </span>
        </p>
      </div>
    </div>
  );
}
