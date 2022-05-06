import { useRef, useState } from 'react';

import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement);

const icons = {
  yes: 'M19.396 20.708c-.81-.062-.733-.812.031-.953 1.269-.234 1.827-.914 1.827-1.543 0-.529-.396-1.022-1.098-1.181-.837-.189-.664-.757.031-.812 1.132-.09 1.688-.764 1.688-1.41 0-.565-.425-1.108-1.261-1.22-.857-.115-.578-.734.031-.922.521-.16 1.354-.5 1.354-1.51 0-.672-.5-1.562-2.271-1.49-1.228.05-3.667-.198-4.979-.885.907-3.657.689-8.782-1.687-8.782-1.594 0-1.896 1.807-2.375 3.469-1.718 5.969-5.156 7.062-8.687 7.603v9.928c6.688 0 8.5 3 13.505 3 3.199 0 4.852-1.735 4.852-2.666-.001-.334-.273-.572-.961-.626z',
  no: 'M19.396 3.292c-.811.062-.734.812.031.953 1.268.234 1.826.914 1.826 1.543 0 .529-.396 1.022-1.098 1.181-.837.189-.664.757.031.812 1.133.09 1.688.764 1.688 1.41 0 .565-.424 1.108-1.26 1.22-.857.115-.578.734.031.922.521.16 1.354.5 1.354 1.51 0 .672-.5 1.562-2.271 1.49-1.228-.05-3.666.198-4.979.885.907 3.657.689 8.782-1.687 8.782-1.594 0-1.896-1.807-2.375-3.469-1.718-5.969-5.156-7.062-8.687-7.603v-9.928c6.688 0 8.5-3 13.505-3 3.198 0 4.852 1.735 4.852 2.666-.001.334-.273.572-.961.626z',
  neutral:
    'M3.291 4.604c.062.811.812.734.953-.031.234-1.268.914-1.826 1.543-1.826.529 0 1.022.396 1.182 1.098.189.837.758.664.812-.031.09-1.133.764-1.688 1.41-1.688.564 0 1.108.424 1.221 1.26.114.857.734.578.922-.031.16-.522.499-1.355 1.51-1.355.672 0 1.562.5 1.49 2.271-.051 1.228.197 3.666.885 4.979 3.656-.906 8.781-.688 8.781 1.688 0 1.594-1.807 1.896-3.469 2.375-5.969 1.719-7.062 5.156-7.604 8.688h-9.927c0-6.688-3-8.5-3-13.505 0-3.198 1.734-4.852 2.666-4.852.334 0 .572.272.625.96z',
};

interface Props {
  className?: string;
  votes: Votes;
  onHover?: (vote: VoteCategory) => void;
}

export interface Votes {
  yes: VoteCategory;
  no: VoteCategory;
  abstination?: VoteCategory;
  notVoted?: VoteCategory;
}

export interface VoteCategory {
  label: string;
  color: string;
  count: number;
}

export default function DoughnutChart({ className, votes, onHover }: Props) {
  const itsNeutral =
    votes.yes.count + votes.no.count < (votes?.abstination?.count ?? 0);
  const itsAYes = votes.yes.count > votes.no.count;

  let ico: string = itsAYes ? icons.yes : icons.no;
  let col = itsAYes ? votes.yes.color : votes.no.color;

  if (itsNeutral) {
    ico = icons.neutral;
    col = votes?.abstination?.color ?? col;
  }
  const chartRef = useRef();

  const colors = Object.values(votes).map((v) => v?.color);
  const counts = Object.values(votes).map((v) => v?.count);

  // current index
  const [index, setIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      <Doughnut
        ref={chartRef}
        className={className}
        options={{
          borderColor: '#fff',
          backgroundColor: '#fff',
          maintainAspectRatio: true,
          aspectRatio: 1,
          responsive: true,
          animation: {
            animateScale: true,
            animateRotate: true,
          },
          spacing: 0,
          cutout: 24,
          onHover: (_, elements) => {
            const i = elements?.length ? elements[0]!.index : null;
            if (i === index) return;

            const item = i !== null ? Object.values(votes)[i] : null;

            setIndex(i);
            if (onHover) {
              onHover(item);
            }
          },
        }}
        data={{
          datasets: [
            {
              borderWidth: 2,
              borderColor: '#fff',
              backgroundColor: colors,
              offset: 0,
              // offset: -6,
              data: counts,
              borderJoinStyle: 'miter',
              // hoverOffset: -2,
              // hoverBorderWidth: 2,
              // hoverBorderColor: '#fff',
              // hoverBorderColor: colors,
              // hoverBorderWidth: 2,
              // hoverOffset: -4,
              // hoverBackgroundColor: colors,
            },
          ],
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path fill={col} d={ico} />
        </svg>
      </div>
    </div>
  );
}
