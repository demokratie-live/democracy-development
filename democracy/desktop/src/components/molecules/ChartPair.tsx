import { useEffect, useRef, useState } from 'react';

import { formatVotes } from '@/utils/Helpers';

import DoughnutChart, { PartyVote, VoteCategory, Votes } from '../organisms/DoughnutChart';
import Image from 'next/image';

function sortPartyVotes(partyVotes: PartyVote[], key: string) {
  try {
    return partyVotes
      .filter((a) => a[key] > 0)
      .sort((a, b) => {
        return b[key] - a[key];
      });
  } catch (e) {
    return [];
  }
}

function slug(name: string): string {
  return name
    .replaceAll(/ü/g, 'ue')
    .replaceAll(/ö/g, 'oe')
    .replaceAll(/ä/g, 'ae')
    .replaceAll(/Ü/g, 'Ue')
    .replaceAll(/Ö/g, 'Oe')
    .replaceAll(/Ä/g, 'Ae')
    .replaceAll(/ß/g, 'ss');
}

export default function ChartPair({ item, className, large }) {
  const [hover1, setHover1] = useState<VoteCategory | undefined>(undefined);
  const [hover2, setHover2] = useState<VoteCategory | undefined>(undefined);

  const [key1, setKey1] = useState<string | undefined>(undefined);
  const [partyVotes, setPartyVotes] = useState<PartyVote[]>([]);

  const [delay, setDelay] = useState<any>(undefined);

  const calculatePercent = (current, total) => {
    return `${Math.round((current / total) * 100)}%`;
  };

  const sizes = large ? '!w-32 !h-32 md:!w-40 md:!h-40' : '!w-28 !h-28';

  const close = () => {
    clearTimeout(delay);
    setDelay(undefined);

    setHover1(undefined);
    setHover2(undefined);
    setPartyVotes([]);
    setKey1(undefined);
  };

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        console.log('CLOSE');
        close();
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  const officialVotes: Votes | undefined = item.voteResults
    ? {
        yes: {
          label: 'Ja',
          color: '#708E32',
          count: item.voteResults.yes ?? 0,
        },
        no: {
          label: 'Nein',
          color: '#C34091',
          count: item.voteResults.no ?? 0,
        },
        abstination: {
          label: 'enthalten',
          color: '#6BAAD0',
          count: item.voteResults.abstination ?? 0,
        },
        notVoted: item.voteResults.notVoted
          ? {
              label: 'abwesend',
              color: '#B1B3B4',
              count: item.voteResults.notVoted,
            }
          : undefined,
        partyVotes: item.voteResults.partyVotes.map((p: any) => ({
          party: p.party,
          main: p.main.toLowerCase(),
          yes: p.deviants?.yes ?? 0,
          no: p.deviants?.no ?? 0,
          abstination: p.deviants?.abstination ?? 0,
          notVoted: p.deviants?.notVoted ?? 0,
        })),
      }
    : undefined;

  return (
    <div
      className={className}
      onMouseLeave={() => {
        setDelay(setTimeout(() => close(), 500));
      }}
    >
      <div ref={ref} className={`flex gap-6 p-2 ${hover1 ? 'bg-white rounded-md overflow-hidden shadow' : ''}`}>
        {item.voteResults && (
          <div className="flex flex-col items-center">
            <DoughnutChart
              onHover={(item1, k1) => {
                // if (!item1) return;
                clearTimeout(delay);

                if (!k1) {
                  setDelay(setTimeout(() => close(), 500));
                } else {
                  setHover1(item1);
                  setPartyVotes(sortPartyVotes(officialVotes?.partyVotes ?? [], k1!));
                  setKey1(k1 ?? undefined);
                }
              }}
              votes={officialVotes!}
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
                        item.voteResults.notVoted,
                    )})`}
                  {!hover1 && (
                    <span>
                      {item.voteResults.namedVote
                        ? `${formatVotes(item.voteResults.yes + item.voteResults.no)} Abgeordnete`
                        : `${item.voteResults.partyVotes.length} Fraktionen`}
                    </span>
                  )}
                </small>
              </span>
            </p>
          </div>
        )}
        {item.communityVotes && (
          <div className="relative flex flex-col items-center">
            <div className={`${partyVotes.length > 0 ? 'opacity-0' : ''}`}>
              <DoughnutChart
                className={`rounded-full bg-white p-0.5 ${sizes}`}
                onHover={(item2) => {
                  setHover2(item2);
                }}
                votes={{
                  yes: {
                    label: 'Ja',
                    color: '#46A058',
                    count: item.communityVotes?.yes ?? 0,
                  },
                  no: {
                    label: 'Nein',
                    color: '#B83829',
                    count: item.communityVotes?.no ?? 0,
                  },
                  abstination: {
                    label: 'enthalten',
                    color: '#4580DD',
                    count: item.communityVotes?.abstination ?? 0,
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
                          item.communityVotes.yes + item.communityVotes.no + item.communityVotes.abstination,
                        )})`
                      : formatVotes(item.votes)}
                    {!hover2 && ' Nutzer'}
                  </small>
                </span>
              </p>
            </div>
            {hover1 && partyVotes.length > 0 && (
              <div className="absolute flex h-full w-full flex-col items-center justify-center text-base">
                {/* <span className="pb-1 pt-px text-sm font-bold">
                  {hover1.label}
                </span> */}
                {partyVotes.map((p) => (
                  <div key={p.party} className="flex w-full items-center justify-between pb-px">
                    <Image
                      src={`/img/parteilogos/unified/${slug(p.party)}.svg`}
                      className={`${large ? 'h-6 w-20' : 'h-5 w-14'} object-cover text-xs italic`}
                      alt={p.party}
                    />
                    <div className="h-full w-full pl-1 text-right text-gray-700">
                      <div
                        className="relative h-full w-full text-sm font-semibold tracking-wide text-gray-600"
                        style={{ borderColor: hover1.color }}
                      >
                        {/* <div
                          style={{
                            backgroundColor: hover1.color,
                            width: `${(
                              (p[key1!] /
                                (p.yes + p.no + p.abstination + p.notVoted)) *
                              100
                            ).toFixed(2)}%`,
                          }}
                          className="flex h-full"
                        ></div> */}
                        <small className="absolute inset-0 px-1">{p[key1!]}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
