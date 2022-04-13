import { ReactNode } from 'react';

import { AppConfig } from '@/utils/AppConfig';

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Main = (props: IMainProps) => (
  <div className="w-full text-gray-700 antialiased">
    {props.meta}

    <div className="min-h-full text-xl">{props.children}</div>

    <footer className="static bottom-0 border-t border-gray-300 bg-gray-200 py-4 text-center text-sm">
      <div>
        © Copyright {new Date().getFullYear()} {AppConfig.title}.
      </div>
      <div role="img" aria-label="Love">
        <span>Made with </span>♥
      </div>
    </footer>
  </div>
);

export { Main };
