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
    // <Listbox value={selectedItem} onChange={setSelectedItem}>
    //   {({ open }) => (
    //     <>
    //       <div className="relative mt-1">
    //         <Listbox.Button className="relative flex w-56 cursor-default items-center rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
    //           <SortDescendingIcon className="mr-2 -ml-1 mt-px h-4 text-gray-700" />{' '}
    //           <span className="block truncate">{selectedItem!.name}</span>
    //           <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    //             <SelectorIcon
    //               className="h-5 w-5 text-gray-400"
    //               aria-hidden="true"
    //             />
    //           </span>
    //         </Listbox.Button>

    //         <Transition
    //           show={open}
    //           as={Fragment}
    //           enter="transition ease-out duration-100"
    //           enterFrom="transform opacity-0 scale-95"
    //           enterTo="transform opacity-100 scale-100"
    //           leave="transition ease-in duration-75"
    //           leaveFrom="transform opacity-100 scale-100"
    //           leaveTo="transform opacity-0 scale-95"
    //         >
    //           <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
    //             {items.map((item) => (
    //               <Listbox.Option
    //                 key={item.id}
    //                 className={({ active }) =>
    //                   classNames(
    //                     active ? 'text-white bg-indigo-600' : 'text-gray-900',
    //                     'cursor-default select-none relative py-2 pl-3 pr-9'
    //                   )
    //                 }
    //                 value={item}
    //               >
    //                 {({ selected, active }) => (
    //                   <>
    //                     <span
    //                       className={classNames(
    //                         selected ? 'font-semibold' : 'font-normal',
    //                         'block truncate'
    //                       )}
    //                     >
    //                       {item.name}
    //                     </span>

    //                     {selected ? (
    //                       <span
    //                         className={classNames(
    //                           active ? 'text-white' : 'text-indigo-600',
    //                           'absolut  e inset-y-0 right-0 flex items-center pr-4'
    //                         )}
    //                       >
    //                         <CheckIcon className="h-5 w-5" aria-hidden="true" />
    //                       </span>
    //                     ) : null}
    //                   </>
    //                 )}
    //               </Listbox.Option>
    //             ))}
    //           </Listbox.Options>
    //         </Transition>
    //       </div>
    //     </>
    //   )}
    // </Listbox>
  );
}

// /* This example requires Tailwind CSS v2.0+ */
// import { Fragment, useEffect, useState } from 'react';

// import { Menu, Transition } from '@headlessui/react';
// import { ChevronDownIcon, SortDescendingIcon } from '@heroicons/react/solid';

// function classNames(...classes: string[]) {
//   return classes.filter(Boolean).join(' ');
// }

// const sorting = [
//   { label: 'Abstimmungsdatum', id: 'voteDate' },
//   { label: 'Aktualisiert', id: 'lastUpdateDate' },
//   { label: 'Aktivität', id: 'activities' },
// ];

// export default function Example({
//   items = [],
//   onSelect = () => {},
// }: {
//   onSelect: (id: string) => void;
// }) {
//   const [sort, setSort] = useState(0);

//   useEffect(() => {
//     onSelect(sorting[sort]!.id);
//   });

//   return (
//     <Menu as="div" className="relative inline-block text-left" >
//       <div>
//         <Menu.Button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
//           <SortDescendingIcon className="mr-2 -ml-1 mt-px h-4 text-gray-700" />{' '}
//           {sorting[sort]?.label}
//           <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
//         </Menu.Button>
//       </div>

//       <Transition
//         as={Fragment}
//         enter="transition ease-out duration-100"
//         enterFrom="transform opacity-0 scale-95"
//         enterTo="transform opacity-100 scale-100"
//         leave="transition ease-in duration-75"
//         leaveFrom="transform opacity-100 scale-100"
//         leaveTo="transform opacity-0 scale-95"
//       >
//         <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
//           <div className="py-1">
//             <Menu.Item>
//               {({ active }) => (
//                 <a
//                   onClick={() => setSort(0)}
//                   className={classNames(
//                     active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                     'block px-4 py-2 text-sm cursor-pointer'
//                   )}
//                 >
//                   Abstimmungsdatum
//                 </a>
//               )}
//             </Menu.Item>
//             <Menu.Item>
//               {({ active }) => (
//                 <a
//                   onClick={() => setSort(1)}
//                   className={classNames(
//                     active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                     'block px-4 py-2 text-sm cursor-pointer'
//                   )}
//                 >
//                   Aktualisiert
//                 </a>
//               )}
//             </Menu.Item>
//             <Menu.Item>
//               {({ active }) => (
//                 <a
//                   onClick={() => setSort(2)}
//                   className={classNames(
//                     active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                     'block px-4 py-2 text-sm cursor-pointer'
//                   )}
//                 >
//                   Aktivität
//                 </a>
//               )}
//             </Menu.Item>
//           </div>
//         </Menu.Items>
//       </Transition>
//     </Menu>
//   );
// }
