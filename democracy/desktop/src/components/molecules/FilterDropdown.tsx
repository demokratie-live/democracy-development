/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useState } from 'react';

import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';

const items = [
  { name: 'Abstimmungsdatum', id: 'voteDate' },
  { name: 'Aktualisiert', id: 'lastUpdateDate' },
  { name: 'Aktivität', id: 'activities' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ onSelect = (_: string) => {} }) {
  const [selectedItem, setSelectedItem] = useState(items[0]);

  useEffect(() => {
    onSelect(selectedItem!.id);
  });
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
          {/* <SortDescendingIcon className="mr-2 -ml-1 mt-1 h-4 text-gray-700" />{' '} */}
          {/* Sortierung */}
          {selectedItem!.name}
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
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none">
          <div className="py-1">
            {items.map((option, index) => (
              <Menu.Item key={option.name}>
                {({ active }) => (
                  <a
                    onClick={() => setSelectedItem(items[index])}
                    className={classNames(
                      option.id === selectedItem!.id
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-700',
                      active ? 'bg-gray-100' : '',
                      'block px-4 py-2 text-sm cursor-pointer'
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
  );
}
