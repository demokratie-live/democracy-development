import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { SearchIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';

import { searchTermState } from '@/components/state/states';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const navigation = [
  { name: 'Sitzungswoche', href: '/' },
  { name: 'Vergangen', href: '/vergangen' },
  { name: 'Top 100', href: '/top-100' },
];

const Navigation = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);

  // TODO: use recoil sync?
  // reset the search if navigating to a different page
  router?.events?.on('routeChangeComplete', (url) => {
    if (url.startsWith('/suche')) return;
    setSearchTerm('');
  });

  // TODO: use recoil sync?
  // update the search term and navigate to the search page
  const updateSearch = (term: string) => {
    setSearchTerm(term);
    if (router.asPath.startsWith('/suche') || term.length < 3) return;
    router.replace(`/suche`);
  };

  return (
    <Disclosure as="nav" className="fixed top-0 z-50 w-full bg-white shadow">
      {({ open }) => (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <Link href="/">
                  <a className="flex shrink-0 items-center">
                    <img
                      className="hidden h-[38px] w-auto lg:flex"
                      src="/assets/images/logo-text.svg"
                      alt="Democracy App"
                    />
                    <img
                      className="flex h-[38px] w-auto lg:hidden"
                      src="/assets/images/logo.svg"
                      alt="Democracy App"
                    />
                  </a>
                </Link>
                <div className="hidden md:mx-10 md:flex md:space-x-6">
                  {/* Current: "border-indigo-500 text-gray-900", Default: "" */}
                  {navigation.map((item) => (
                    <Link href={item.href} key={item.href}>
                      <a
                        className={classNames(
                          router.pathname === item.href
                            ? 'border-ci-blue text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium text-gray-900'
                        )}
                      >
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center pl-2 lg:ml-6 lg:justify-end">
                <div className="w-full max-w-lg lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">
                    Suche
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <SearchIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:placeholder:text-gray-400 sm:text-sm"
                      placeholder="Suche"
                      type="search"
                      value={searchTerm}
                      onChange={(e) => updateSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center lg:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" */}
              {navigation.map((item) => (
                <Link href={item.href} key={`mobile-${item.href}`} passHref>
                  <Disclosure.Button
                    as="a"
                    href="item.href"
                    onClick={(e: any) => {
                      e.preventDefault();
                      router.push(item.href);
                    }}
                    className={classNames(
                      router.pathname === item.href
                        ? 'bg-indigo-50 border-ci-darker text-ci-darker font-bold'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium rounded-md'
                      // 'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium text-gray-900'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                </Link>
              ))}
            </div>
            {/* <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-4">
                <div className="shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    Tom Cook
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    tom@example.com
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-auto shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Your Profile
                </Disclosure.Button>
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Settings
                </Disclosure.Button>
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div> */}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

export default Navigation;
