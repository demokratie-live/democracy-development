import { gql, useQuery } from '@apollo/client';
import dayjs from 'dayjs';

import FilterDropdown from '@/components/molecules/FilterDropdown';
import { Meta } from '@/layout/Meta';
import { Main } from '@/templates/Main';

/**
 * just a hacky dummy for getting correct data
 * @param term string
 * @returns string
 */
const getImage = (term: string) =>
  `https://democracy-app.de/static/images/sachgebiete/${encodeURIComponent(
    term
      ?.replace(/ /g, '_')
      .replace(/-/g, '_')
      .toLowerCase()
      .replace(/_und_/g, '_')
      .replace(/,/g, '_')
      .replace(/__/g, '_')
      .replace(/ß/g, 'ss')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace('aussenpolitik_internationale_beziehungen', 'aussenpolitik')
      .replace('raumordnung_bau_wohnungswesen', 'bauwesen')
  )}_648.jpg`;

const GET_PROCEDURES = gql`
  query procedures(
    $offset: Int
    $pageSize: Int
    $listTypes: [ListType!]
    $sort: String
    $filter: ProcedureFilter
  ) {
    procedures(
      offset: $offset
      pageSize: $pageSize
      listTypes: $listTypes
      sort: $sort
      filter: $filter
    ) {
      title
      procedureId
      type
      votes
      communityVotes {
        yes
        no
        abstination
        __typename
      }
      voteDate
      subjectGroups
      currentStatus
      voteResults {
        yes
        no
        abstination
        notVoted
        decisionText
        namedVote
        partyVotes {
          main
          party
          deviants {
            yes
            abstination
            no
            notVoted
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

const Index = () => {
  /* const router = useRouter(); */

  const { loading, error, data } = useQuery(GET_PROCEDURES, {
    variables: {
      filter: {
        subjectGroups: [
          'Arbeit und Beschäftigung',
          'Ausländerpolitik, Zuwanderung',
          'Außenpolitik und internationale Beziehungen',
          'Außenwirtschaft',
          'Bildung und Erziehung',
          'Bundestag',
          'Energie',
          'Entwicklungspolitik',
          'Europapolitik und Europäische Union',
          'Gesellschaftspolitik, soziale Gruppen',
          'Gesundheit',
          'Innere Sicherheit',
          'Kultur',
          'Landwirtschaft und Ernährung',
          'Medien, Kommunikation und Informationstechnik',
          'Neue Bundesländer / innerdeutsche Beziehungen',
          'Öffentliche Finanzen, Steuern und Abgaben',
          'Politisches Leben, Parteien',
          'Raumordnung, Bau- und Wohnungswesen',
          'Recht',
          'Soziale Sicherung',
          'Sport, Freizeit und Tourismus',
          'Staat und Verwaltung',
          'Umwelt',
          'Verkehr',
          'Verteidigung',
          'Wirtschaft',
          'Wissenschaft, Forschung und Technologie',
        ],
        type: ['Antrag', 'Gesetzgebung'],
      },
      listTypes: ['PAST'],
      pageSize: 15,
      sort: 'voteDate',
    },
  });

  if (loading)
    return (
      <div className="flex h-screen pt-16">
        <div className="mb-32 flex w-full items-center justify-center">
          <div className="flex items-center justify-center space-x-1 text-base text-gray-600">
            <svg
              fill="none"
              className="h-10 w-10 animate-spin"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>

            <div>bitte warten ...</div>
          </div>
        </div>
      </div>
    );
  if (error) return <div className="pt-16">Error! {error.message}</div>;

  return (
    <Main meta={<Meta title={''} description={''} />}>
      <div className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        {/* <div className="absolute inset-0">
          <div className="h-1/3 bg-white sm:h-2/3" />
        </div> */}
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div className="">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Abgestimmt
              </h2>
              <p className="-mt-1 max-w-2xl text-base text-gray-600">
                Hier siehst Du alle bereits abgestimmten Vorgänge
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <FilterDropdown />
            </div>
          </div>
          <div className="3xl:grid-cols-4 mx-auto mt-6 grid max-w-md gap-5 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
            {data.procedures.map((item: any) => (
              <div
                key={item.title}
                className="flex flex-col overflow-hidden rounded-lg border shadow-lg"
              >
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
                <div className="shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src={getImage(item.subjectGroups[0]!)}
                    alt=""
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      <a href={item.type} className="hover:underline">
                        {item.type}
                      </a>
                    </p>
                    <a href={item.type} className="mt-2 block">
                      <p className="text-xl font-semibold leading-6 text-gray-900 line-clamp-3">
                        {item.title}
                      </p>
                      {/* <p className="mt-3 text-base text-gray-500">
                        {item.description}
                      </p> */}
                    </a>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div>
                      {/* <p className="text-sm font-medium text-gray-900">
                        <a href={item.author.href} className="hover:underline">
                          {item.author.name}
                        </a>
                      </p> */}
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={item.voteDate}>
                          {dayjs(item.voteDate).format('DD.MM.YYYY')}
                        </time>
                        {/* {item.subjectGroups[0]?.replace(' ', '_').toLowerCase()} */}
                        {/* <span aria-hidden="true">&middot;</span>
                        <span>{item.voteDate}</span> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Main>
  );
};

export default Index;
