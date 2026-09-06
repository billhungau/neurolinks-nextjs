import * as migration_20260906_072109_initial from './20260906_072109_initial';

export const migrations = [
  {
    up: migration_20260906_072109_initial.up,
    down: migration_20260906_072109_initial.down,
    name: '20260906_072109_initial'
  },
];
