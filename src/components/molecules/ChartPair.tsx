import { useState } from 'react';

import { formatVotes } from '@/utils/Helpers';

import DoughnutChart, { VoteCategory } from '../organisms/DoughnutChart';

export default function ChartPair({ item, className, large }) {
  // hover state 1
  const [hover1, setHover1] = useState<VoteCategory | undefined>(undefined);
  const [hover2, setHover2] = useState<VoteCategory | undefined>(undefined);

  const calculatePercent = (current, total) => {
    return `${Math.round((current / total) * 100)}%`;
  };

  const sizes = large ? '!w-32 !h-32 md:!w-40 md:!h-40' : '!w-28 !h-28';
  return (
    <div className={className}>
      {item.voteResults && (
        <div className="flex flex-col items-center">
          <DoughnutChart
            onHover={(item1) => {
              setHover1(item1);
            }}
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
                label: 'enthalten',
                color: '#6BAAD0',
                count: item.voteResults.abstination,
              },
              notVoted: item.voteResults.notVoted
                ? {
                    label: 'abwesend',
                    color: '#B1B3B4',
                    count: item.voteResults.notVoted,
                  }
                : undefined,
            }}
            className={`rounded-full bg-white p-0.5 ${sizes}`}
          />
          <p className="flex flex-col items-center pb-1 pt-px text-xs leading-[1.1em]">
            <span className="text-[1.1em] font-bold">Bundestag</span>
            <span className="text-sm font-semibold tracking-wide text-gray-600">
              <small>
                {hover1 &&
                  `${hover1.label} (${calculatePercent(
                    hover1.count,
                    item.voteResults.yes +
                      item.voteResults.no +
                      item.voteResults.abstination +
                      item.voteResults.notVoted
                  )})`}
                {!hover1 && (
                  <span>
                    {item.voteResults.namedVote
                      ? `${formatVotes(
                          item.voteResults.yes + item.voteResults.no
                        )} Abgeordnete`
                      : `${item.voteResults.partyVotes.length} Fraktionen`}
                  </span>
                )}
              </small>
            </span>
          </p>
        </div>
      )}
      <div className="flex flex-col items-center">
        <DoughnutChart
          className={`rounded-full bg-white p-0.5 ${sizes}`}
          onHover={(item2) => {
            setHover2(item2);
          }}
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
              label: 'enthalten',
              color: '#4580DD',
              count: item.communityVotes.abstination,
            },
          }}
        />
        <p className="flex flex-col items-center pb-1 pt-px text-xs leading-[1.1em]">
          <span className="text-[1.1em] font-bold">Community</span>
          <span className="text-sm font-semibold tracking-wide text-gray-600">
            <small>
              {hover2
                ? `${hover2.label} (${calculatePercent(
                    hover2.count,
                    item.communityVotes.yes +
                      item.communityVotes.no +
                      item.communityVotes.abstination
                  )})`
                : formatVotes(item.votes)}
              {!hover2 && ' Nutzer'}
            </small>
          </span>
        </p>
      </div>
    </div>
  );
}
