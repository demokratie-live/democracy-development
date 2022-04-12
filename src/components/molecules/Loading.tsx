const Loading = () => (
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

export default Loading;
