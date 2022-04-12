import { Disclosure } from '@headlessui/react';
import { FilterIcon } from '@heroicons/react/outline';

import { AppConfig } from '@/utils/AppConfig';

const { filters } = AppConfig;

export default function Filters({
  selected = [],
  onToggle = (_: string) => {},
  onReset = () => {},
}) {
  return (
    <Disclosure
      as="section"
      aria-labelledby="filter-heading"
      className="relative z-10 grid items-center border-y border-gray-200"
    >
      <h2 id="filter-heading" className="sr-only">
        Filters
      </h2>
      <div className="relative col-start-1 row-start-1 border-b border-gray-300 py-4 ">
        <div className="mx-auto flex max-w-7xl space-x-6 divide-x divide-gray-200 px-4 text-sm sm:px-6 lg:px-8">
          <div>
            <Disclosure.Button className="group flex items-center font-medium text-gray-700">
              <FilterIcon
                className="mr-2 h-5 w-5 flex-none text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              {selected.length} Filter
            </Disclosure.Button>
          </div>
          {selected.length > 0 ? (
            <div className="pl-6">
              <button
                type="button"
                className="text-gray-500"
                onClick={() => onReset()}
              >
                Zurücksetzen
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <Disclosure.Panel className="bg-white py-5">
        <div className="mx-auto grid max-w-7xl select-none gap-y-12 px-8 text-sm md:grid-cols-6">
          <fieldset className="col-span-2 lg:col-span-1">
            <legend className="block font-medium">{filters.type.label}</legend>
            <div className="space-y-1 pt-6 sm:pt-4">
              {filters.type.options.map((option, optionIdx) => (
                <div
                  key={option.value}
                  className="flex items-start text-base sm:text-sm"
                >
                  <input
                    id={`size-${optionIdx}`}
                    name="size[]"
                    defaultValue={option.value}
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selected.includes(option.value as never)}
                    onChange={() => onToggle(option.value)}
                  />
                  <label
                    htmlFor={`size-${optionIdx}`}
                    className="ml-2 min-w-0 flex-1 cursor-pointer py-1 leading-4 text-gray-600 lg:text-[0.90em]"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <fieldset className="col-span-4 lg:col-span-5">
            <legend className="block font-medium">
              {filters.subjectGroups.label}
            </legend>
            <div className="grid auto-cols-min grid-cols-1 gap-x-6 gap-y-1 pt-6 sm:pt-4 lg:grid-cols-2 xl:grid-cols-3">
              {filters.subjectGroups.options.map((option, optionIdx) => (
                <div
                  key={option.value}
                  className="flex items-start text-base sm:text-sm"
                >
                  <input
                    id={`category-${optionIdx}`}
                    name="category[]"
                    defaultValue={option.value}
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selected.includes(option.value as never)}
                    onChange={() => onToggle(option.value)}
                  />
                  <label
                    htmlFor={`category-${optionIdx}`}
                    className="ml-2 min-w-0 flex-1 cursor-pointer py-1 leading-4 text-gray-600 lg:text-[0.90em]"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
}
