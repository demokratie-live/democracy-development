export default function Empty() {
  return (
    <div className="col-span-12 py-12 text-center">
      <svg
        className="mx-auto h-12 w-12 text-ci-pink"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        Nichts gefunden
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        Leider haben wir hier nichts gefunden.
      </p>
    </div>
  );
}
