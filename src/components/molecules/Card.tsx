import dayjs from 'dayjs';

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

const Card = ({ item }: any) => (
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
    <div className="shrink-0">
      <img
        className="h-48 w-full object-cover"
        src={getImage(item.subjectGroups[0])}
        alt=""
      />
    </div>
    <div className="flex flex-1 flex-col justify-between bg-white p-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-ci-blue-darker">
          <a href={item.type} className="hover:underline">
            {item.type}
          </a>
        </p>
        <a href={item.type} className="mt-2 block">
          <p className="text-xl font-semibold leading-6 text-gray-900 line-clamp-3">
            {item.title}
          </p>
          {/* <p className="mt-3 text-base text-gray-500">
              {description}
            </p> */}
        </a>
      </div>
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
    </div>
  </div>
);

export default Card;
