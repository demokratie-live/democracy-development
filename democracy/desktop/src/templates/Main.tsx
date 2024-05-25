import { AppConfig } from '@/utils/AppConfig';

type IMainProps = {
  meta: React.ReactNode;
  children: React.ReactNode;
};

const Main = (props: IMainProps) => (
  <div className="flex min-h-screen w-full flex-col text-gray-700 antialiased">
    {props.meta}

    <div className="grow text-xl">{props.children}</div>

    <footer className="border-t border-gray-300 bg-gray-200 pt-3 pb-5 text-center text-sm">
      {/* <div>
        © Copyright {new Date().getFullYear()} – {AppConfig.site_name}
      </div> */}
      <div className="flex items-center justify-center">
        <a
          target="_blank"
          href="https://www.democracy-deutschland.de/#!impressum"
          rel="noreferrer"
          className="p-2 hover:underline"
        >
          Impressum
        </a>
        <a
          target="_blank"
          href="https://www.democracy-deutschland.de/#!nutzungsbedingungen"
          rel="noreferrer"
          className="p-2 hover:underline"
        >
          Nutzungsbedingungen
        </a>
        <a
          target="_blank"
          href="https://www.democracy-deutschland.de/#!datenschutz"
          rel="noreferrer"
          className="p-2 hover:underline"
        >
          Datenschutz
        </a>
      </div>
      <div className="text-gray-600">
        <span>Made {new Date().getFullYear()} with </span>
        <span className="text-red-500" role="img" aria-label="Love">
          ♥
        </span>
        <span> by {AppConfig.site_name}</span>
      </div>
    </footer>
  </div>
);

export { Main };
