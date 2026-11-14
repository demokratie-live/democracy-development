// nextjs config
module.exports = {
  // the old start page only showed a heading
  async redirects() {
    return [{ source: '/', destination: '/procedures', permanent: false }];
  },
};
