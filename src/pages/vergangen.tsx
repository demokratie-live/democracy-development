/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment, useState } from 'react';

import {
  Dialog,
  Disclosure,
  Menu,
  Popover,
  Transition,
} from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { ChevronDownIcon } from '@heroicons/react/solid';

const sortOptions = [
  { name: 'Abstimmungsdatum', href: '#', current: true },
  { name: 'Aktualisierung', href: '#', current: false },
  { name: 'Aktivität', href: '#', current: false },
];
const filters = [
  {
    id: 'category',
    name: 'Sachgebiete',
    options: [
      {
        value: 'Arbeit und Beschäftigung',
        label: 'Arbeit und Beschäftigung',
        checked: false,
      },
      {
        value: 'Ausländerpolitik, Zuwanderung',
        label: 'Ausländerpolitik, Zuwanderung',
        checked: false,
      },
      {
        value: 'Außenpolitik und internationale Beziehungen',
        label: 'Außenpolitik und internationale Beziehungen',
        checked: false,
      },
      { value: 'Außenwirtschaft', label: 'Außenwirtschaft', checked: false },
      {
        value: 'Bildung und Erziehung',
        label: 'Bildung und Erziehung',
        checked: false,
      },
      { value: 'Bundestag', label: 'Bundestag', checked: true },
      { value: 'Energie', label: 'Energie', checked: false },
      {
        value: 'Entwicklungspolitik',
        label: 'Entwicklungspolitik',
        checked: false,
      },
      {
        value: 'Europapolitik und Europäische Union',
        label: 'Europapolitik und Europäische Union',
        checked: false,
      },
      {
        value: 'Gesellschaftspolitik, soziale Gruppen',
        label: 'Gesellschaftspolitik, soziale Gruppen',
        checked: false,
      },
      { value: 'Gesundheit', label: 'Gesundheit', checked: false },
      {
        value: 'Innere Sicherheit',
        label: 'Innere Sicherheit',
        checked: false,
      },
      { value: 'Kultur', label: 'Kultur', checked: false },
      {
        value: 'Landwirtschaft und Ernährung',
        label: 'Landwirtschaft und Ernährung',
        checked: false,
      },
      {
        value: 'Medien, Kommunikation und Informationstechnik',
        label: 'Medien, Kommunikation und Informationstechnik',
        checked: false,
      },
      {
        value: 'Neue Bundesländer / innerdeutsche Beziehungen',
        label: 'Neue Bundesländer / innerdeutsche Beziehungen',
        checked: false,
      },
      {
        value: 'Öffentliche Finanzen, Steuern und Abgaben',
        label: 'Öffentliche Finanzen, Steuern und Abgaben',
        checked: false,
      },
      {
        value: 'Politisches Leben, Parteien',
        label: 'Politisches Leben, Parteien',
        checked: false,
      },
      {
        value: 'Raumordnung, Bau- und Wohnungswesen',
        label: 'Raumordnung, Bau- und Wohnungswesen',
        checked: false,
      },
      { value: 'Recht', label: 'Recht', checked: false },
      {
        value: 'Soziale Sicherung',
        label: 'Soziale Sicherung',
        checked: false,
      },
      {
        value: 'Sport, Freizeit und Tourismus',
        label: 'Sport, Freizeit und Tourismus',
        checked: false,
      },
      {
        value: 'Staat und Verwaltung',
        label: 'Staat und Verwaltung',
        checked: false,
      },
      { value: 'Umwelt', label: 'Umwelt', checked: false },
      { value: 'Verkehr', label: 'Verkehr', checked: false },
      { value: 'Verteidigung', label: 'Verteidigung', checked: false },
      { value: 'Wirtschaft', label: 'Wirtschaft', checked: false },
      {
        value: 'Wissenschaft, Forschung und Technologie',
        label: 'Wissenschaft, Forschung und Technologie',
        checked: false,
      },
    ],
  },
  /*  {
    id: 'color',
    name: 'Color',
    options: [
      { value: 'white', label: 'White', checked: false },
      { value: 'beige', label: 'Beige', checked: false },
      { value: 'blue', label: 'Blue', checked: false },
    ],
  },
  {
    id: 'sizes',
    name: 'Sizes',
    options: [
      { value: 's', label: 'S', checked: false },
      { value: 'm', label: 'M', checked: false },
      { value: 'l', label: 'L', checked: false },
    ],
  }, */
];
const activeFilters = [{ value: 'Bundestag', label: 'Bundestag' }];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-200">
      {/* Mobile filter dialog */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 flex sm:hidden"
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Filters */}
              <form className="mt-4">
                {filters.map((section) => (
                  <Disclosure
                    as="div"
                    key={section.name}
                    className="border-t border-gray-200 px-4 py-6"
                  >
                    {() => (
                      <>
                        <h3 className="-mx-2 -my-3 flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
                            <span className="font-medium text-gray-900">
                              {section.name}
                            </span>
                            <span className="ml-6 flex items-center">
                              <ChevronDownIcon
                                className={classNames(
                                  open ? '-rotate-180' : 'rotate-0',
                                  'h-5 w-5 transform'
                                )}
                                aria-hidden="true"
                              />
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-6">
                          <div className="space-y-6">
                            {section.options.map((option, optionIdx) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`filter-mobile-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="checkbox"
                                  defaultChecked={option.checked}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label
                                  htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                  className="ml-3 text-sm text-gray-500"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </form>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>

      <div className="mx-auto max-w-7xl py-16 px-4 pt-28 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Abgestimmt
        </h1>
        <p className="max-w-xl text-sm text-gray-600">
          Hier siehst Du alle bereits abgestimmten Vorgänge
        </p>
      </div>

      {/* Filters */}
      <section aria-labelledby="filter-heading">
        <h2 id="filter-heading" className="sr-only">
          Filters
        </h2>

        <div className="relative z-10 border-b border-gray-300 bg-gray-200 pb-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sortierung
                  <ChevronDownIcon
                    className="-mr-1 ml-1 h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none">
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <Menu.Item key={option.name}>
                        {({ active }) => (
                          <a
                            href={option.href}
                            className={classNames(
                              option.current
                                ? 'font-medium text-gray-900'
                                : 'text-gray-600',
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            {option.name}
                          </a>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <button
              type="button"
              className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
              onClick={() => setOpen(true)}
            >
              Filter
            </button>

            <div className="hidden sm:block">
              <div className="flow-root">
                <Popover.Group className="-mx-4 flex items-center divide-x divide-gray-200">
                  {filters.map((section, sectionIdx) => (
                    <Popover
                      key={section.name}
                      className="inline-block px-4 text-left"
                    >
                      <Popover.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                        <span>{section.name}</span>
                        {sectionIdx === 0 ? (
                          <span className="ml-1.5 rounded bg-gray-300 py-0.5 px-1.5 text-xs font-semibold tabular-nums text-gray-700">
                            1
                          </span>
                        ) : null}
                        <ChevronDownIcon
                          className="-mr-1 ml-1 h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                      </Popover.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Popover.Panel className="absolute right-0 mt-2 w-screen ">
                          <form className="mx-auto grid max-w-7xl grid-cols-2 space-y-4 rounded-md border bg-white py-4 px-6 pb-8 shadow-2xl md:grid-cols-3 lg:grid-cols-4">
                            {section.options.map((option, optionIdx) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="checkbox"
                                  defaultChecked={option.checked}
                                  className="h-4 w-4 rounded border-gray-300 text-ci-blue focus:ring-ci-blue"
                                />
                                <label
                                  htmlFor={`filter-${section.id}-${optionIdx}`}
                                  className="ml-3 pr-6 text-sm font-medium leading-4 text-gray-900"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  ))}
                </Popover.Group>
              </div>
            </div>
          </div>
        </div>

        {/* Active filters */}
        <div className="bg-gray-100">
          <div className="mx-auto max-w-7xl py-3 px-4 sm:flex sm:items-center sm:px-6 lg:px-8">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Filter
              <span className="sr-only">, active</span>
            </h3>

            <div
              aria-hidden="true"
              className="hidden h-5 w-px bg-gray-300 sm:ml-4 sm:block"
            />

            <div className="mt-2 sm:mt-0 sm:ml-4">
              <div className="-m-1 flex flex-wrap items-center">
                {activeFilters.map((activeFilter) => (
                  <span
                    key={activeFilter.value}
                    className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-900"
                  >
                    <span>{activeFilter.label}</span>
                    <button
                      type="button"
                      className="ml-1 inline-flex h-4 w-4 shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                    >
                      <span className="sr-only">
                        Remove filter for {activeFilter.label}
                      </span>
                      <svg
                        className="h-2 w-2"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 8 8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeWidth="1.5"
                          d="M1 1l6 6m0-6L1 7"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
