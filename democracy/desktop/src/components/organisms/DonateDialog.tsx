import { Fragment, useMemo, useRef, useState } from 'react';

import { Dialog, Transition } from '@headlessui/react';
// import { CheckIcon } from '@heroicons/react/24/outline';

export default function DonateDialog() {
  const [open, setOpen] = useState(false);
  useMemo(() => {
    const timeout = setTimeout(() => {
      setOpen(true);
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  const cancelButtonRef = useRef(null);
  const acceptButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={acceptButtonRef}
        onClose={() => {}}
        // onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gradient-to-t from-gray-800/80 to-gray-800/20 transition-opacity md:via-gray-800/30" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4  sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  {/* <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div> */}
                  <div className="mt-2 sm:mt-1">
                    <Dialog.Title
                      as="h3"
                      className="px-2 text-xl font-semibold leading-6 text-gray-900 sm:px-0"
                    >
                      Wir brauchen Dich! 🫵🏼
                    </Dialog.Title>
                    <div className="mt-4">
                      <p className=" px-2 text-gray-700 sm:px-0 sm:pb-2 sm:pt-1 sm:text-base">
                        Sichere die Existenz der DEMOCRACY App, indem Du das
                        Projekt{' '}
                        <a
                          href="https://www.democracy-deutschland.de/#!donate"
                          onClick={() => setOpen(false)}
                          target="_blank"
                          className="text-ci-blue underline"
                          rel="noreferrer"
                        >
                          finanziell
                        </a>{' '}
                        unterstützt!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-ci-blue-dark px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-ci-blue-darker focus:outline-none focus:ring-2 focus:ring-ci-blue-darker focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    ref={acceptButtonRef}
                    onClick={() => {
                      window.open(
                        'https://www.paypal.com/donate/?hosted_button_id=PR4PJL4AY8RSL',
                        '_blank'
                      );
                      setOpen(false);
                    }}
                  >
                    Spenden
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-normal text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ci-blue-darker focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Jetzt Nicht
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
