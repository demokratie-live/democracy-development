import { useRef } from 'react';

import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import useDimensions from 'react-cool-dimensions';
import { useIntersection } from 'react-use';
import { useRecoilState } from 'recoil';

import { makeLink, getImage } from '@/utils/Helpers';

import { filterForTypeState } from '../state/states';
import ChartPair from './ChartPair';

const Card = ({ item }: any) => {
  const [, setFilterType] = useRecoilState(filterForTypeState);
  const { observe, width } = useDimensions();
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '350px',
    threshold: 1,
  });

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border shadow-lg"
      ref={intersectionRef}
    >
      <Link href={makeLink(item)}>
        <a
          className="relative shrink-0 cursor-pointer bg-white pb-10 "
          ref={observe}
        >
          <div className="relative flex aspect-teaser flex-col justify-center overflow-hidden">
            <Image
              className="object-cover"
              src={getImage(item.subjectGroups[0])}
              width={1920}
              height={1024}
              layout="responsive"
              sizes={width !== undefined ? `${Math.round(width)}px` : '800px'}
              alt={item.subjectGroups[0] ?? 'Bundestag'}
            />
          </div>
          {!intersection ||
            (intersection.isIntersecting && (
              <ChartPair
                item={item}
                className="absolute -bottom-3 flex w-full items-center justify-center space-x-2 border-white"
                large={false}
              />
            ))}
        </a>
      </Link>
      <div className="flex flex-1 flex-col justify-between bg-white p-6">
        <div className="flex-1">
          <div className="text-sm font-medium text-ci-blue-darker">
            <div
              onClick={(e) => {
                e.preventDefault();
                setFilterType([item.type as never]);
              }}
              className="cursor-pointer hover:underline"
            >
              {item.type}
            </div>
          </div>
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
