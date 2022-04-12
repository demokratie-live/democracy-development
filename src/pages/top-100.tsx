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

import { useState } from 'react';

import Filters from '@/components/molecules/Filters';

export default function Example() {
  const [selected, setSelected] = useState(['Arbeit und Beschäftigung']);

  return (
    <div className="bg-gray-200">
      <div className="mx-auto max-w-7xl px-4 pb-7 pt-28 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Vergangen
        </h1>
        <p className="max-w-xl text-sm text-gray-600">
          Hier siehst Du alle bereits abgestimmten Vorgänge
        </p>
      </div>
      <Filters
        selected={selected as never}
        onToggle={(id: string) => {
          if (selected.includes(id)) {
            // remove
            setSelected(selected.filter((s) => s !== id));
          } else {
            // add
            setSelected([...selected, id]);
          }
        }}
        onReset={() => setSelected([])}
      />
    </div>
  );
}
