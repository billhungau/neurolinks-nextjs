import * as migration_20260906_072109_initial from './20260906_072109_initial';
import * as migration_20260907_060000_ai_sources from './20260907_060000_ai_sources';
import * as migration_20260911_050605_scheduled_publish from './20260911_050605_scheduled_publish';

export const migrations = [
  {
    up: migration_20260906_072109_initial.up,
    down: migration_20260906_072109_initial.down,
    name: '20260906_072109_initial',
  },
  {
    up: migration_20260907_060000_ai_sources.up,
    down: migration_20260907_060000_ai_sources.down,
    name: '20260907_060000_ai_sources',
  },
  {
    up: migration_20260911_050605_scheduled_publish.up,
    down: migration_20260911_050605_scheduled_publish.down,
    name: '20260911_050605_scheduled_publish'
  },
];
