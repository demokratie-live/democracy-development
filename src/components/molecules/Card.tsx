import dayjs from 'dayjs';
import Link from 'next/link';
import { useRecoilState } from 'recoil';

import { makeLink, getImage } from '@/utils/Helpers';

import { filterForTypeState } from '../state/states';

const Card = ({ item }: any) => {
  const [, setFilterType] = useRecoilState(filterForTypeState);
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border shadow-lg">
      {/* <DonutChart
        colors={['#16C063', '#2882E4', '#EC3E31']}
        innerTextBottom="Abstimmende"
        innerTextTop="3"
        size={500}
        topLeftText="Bundesweit"
        votesData={{
          abstination: 1,
          no: 1,
          yes: 1,
        }}
      /> */}
      <Link href={makeLink(item)}>
        <a className="shrink-0 cursor-pointer">
          <img
            className="h-48 w-full object-cover"
            src={getImage(item.subjectGroups[0])}
            alt=""
          />
        </a>
      </Link>
      <div className="flex flex-1 flex-col justify-between bg-white p-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-ci-blue-darker">
            <a
              onClick={(e) => {
                e.preventDefault();
                setFilterType([item.type as never]);
              }}
              className="cursor-pointer hover:underline"
            >
              {item.type}
            </a>
          </p>
          <Link href={makeLink(item)}>
            <a className="mt-2 block">
              <p className="hyphens-auto text-xl font-semibold leading-6 text-gray-900 line-clamp-3">
                {item.title}
              </p>
              <p className="hyphens-auto pt-2 text-base leading-5 text-gray-700 line-clamp-3">
                {item.sessionTOPHeading}
              </p>
              {/* <p className="mt-3 text-base text-gray-500">
                {description}
              </p> */}
            </a>
          </Link>
        </div>
        {item.voteDate && (
          <div className="mt-6 flex items-center">
            <div>
              {/* <p className="text-sm font-medium text-gray-900">
              <a href={author.href} className="hover:underline">
                {author.name}
              </a>
            </p> */}
              <div className="flex space-x-1 text-sm text-gray-500">
                <time dateTime={item.voteDate}>
                  {dayjs(item.voteDate).format('DD.MM.YYYY')}
                </time>
                {/* {subjectGroups[0]?.replace(' ', '_').toLowerCase()} */}
                {/* <span aria-hidden="true">&middot;</span>
              <span>{voteDate}</span> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
