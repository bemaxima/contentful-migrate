import { MigrationFunction } from 'contentful-migration';

const description = '<Put your description here>';

const up: MigrationFunction = (migration) => {
  // Add your UP migration script here. See examples here:
  // https://github.com/contentful/migration-cli/tree/master/examples
};

const down: MigrationFunction = (migration) => {
  // Add your DOWN migration script here. See examples here:
  // https://github.com/contentful/migration-cli/tree/master/examples
};

export {
  description,
  up,
  down
}
