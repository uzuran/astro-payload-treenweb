import * as migration_20260905_201959_initial from './20260905_201959_initial';

export const migrations = [
  {
    up: migration_20260905_201959_initial.up,
    down: migration_20260905_201959_initial.down,
    name: '20260905_201959_initial'
  },
];
