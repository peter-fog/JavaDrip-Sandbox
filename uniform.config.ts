import type { CLIConfiguration } from '@uniformdev/cli';

const config: CLIConfiguration = {
  serialization: {
    entitiesConfig: {
      dataType: {},
      contentType: {},
      entry: {},
      category: {},
      pattern: { publish: true },
      component: {},
      composition: { publish: true },
      projectMapDefinition: {},
      projectMapNode: {},
      signal: {},
      enrichment: {},
      quirk: {},
      redirect: {},
      aggregate: {},
      test: {},
      asset: {},
    },
    directory: './content/',
    format: 'yaml',
  },
};

module.exports = config;
