interface Props {
  slim?: boolean;
}

const Loading = ({ slim }: Props) => (
  <div className={`inline-flex w-screen ${slim !== true && 'h-[75px]'}`}>
    <div className="flex w-full max-w-7xl items-center justify-center">
      <div
        className={`${
          slim !== true && 'mb-[50vh]'
        } flex items-center justify-center space-x-1 text-base text-ci-blue-dark`}
      >
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

        <div>einen Moment noch…</div>
      </div>
    </div>
  </div>
);

export default Loading;
