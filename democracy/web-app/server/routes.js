const UrlPrettifier = require('next-url-prettifier').default;

const routes = [
  {
    page: 'index',
    prettyUrl: ({ listType = '' }) => `/${listType}`,
    prettyUrlPatterns: [
      { pattern: '/', defaultParams: { listType: 'in-abstimmung' } },
      { pattern: '/vergangen', defaultParams: { listType: 'vergangen' } },
      { pattern: '/in-vorbereitung', defaultParams: { listType: 'in-vorbereitung' } },
      { pattern: '/whats-hot', defaultParams: { listType: 'whats-hot' } },
    ],
  },
  {
    page: 'details',
    prettyUrl: ({ type = '', id = '', title = '' }) => `/${type}/${id}/${title}`,
    prettyUrlPatterns: [{ pattern: '/:type/:id/:title' }],
  },
];

const urlPrettifier = new UrlPrettifier(routes);
exports.default = routes;
exports.Router = urlPrettifier;
