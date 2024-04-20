import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    // 'src/__generated/gql/': {
    //   schema: 'https://internal.api.bundestag.io',
    //   preset: 'client',
    //   documents: 'src/**/*.bio.graphql',
    //   config: {
    //     documentMode: 'string',
    //   },
    //   plugins: [],
    // },
    'src/__generated/gql-ai/': {
      schema: {
        [process.env.AI_SERVER_URL_CODEGEN!]: {
          headers: {
            'x-token': process.env.AI_ACCESS_TOKEN!,
          },
        },
      },
      preset: 'client',
      documents: 'src/**/*.ai.graphql',
      plugins: [],
    },
  },
};

export default config;
