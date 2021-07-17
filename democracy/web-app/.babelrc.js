module.exports = {
  presets: ['next/babel'],
  plugins: [
    ["inline-react-svg",
    {
      "svgo": {
        "plugins": [
          {
            "cleanupIDs": {
              "prefix": {
                toString() {
                  this.counter = this.counter || 0;
                  return `id-${this.counter++}`;
                }
              }
            }
          }
        ]
      }
    }],
    ['styled-components', { ssr: true, displayName: true, preprocess: false }],
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    [
      'import',
      {
        libraryName: 'antd',
        style: false,
      },
    ],
  ],
};

// {
//   presets: ['next/babel', '@babel/preset-env'],
//   plugins: [['styled-components', { ssr: true, displayName: true, preprocess: false }]],
//   env: {
//     development: {
//       plugins: ['inline-dotenv'],
//     },
//     production: {
//       plugins: ['transform-inline-environment-variables'],
//     },
//   },
// };
