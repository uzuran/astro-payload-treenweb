import * as migration_20260905_201959_initial from './20260905_201959_initial';
import * as migration_20260905_215006_hero_animation from './20260905_215006_hero_animation';
import * as migration_20260905_223619_rounded from './20260905_223619_rounded';
import * as migration_20260905_225343_hero_photo_rounded from './20260905_225343_hero_photo_rounded';

export const migrations = [
  {
    up: migration_20260905_201959_initial.up,
    down: migration_20260905_201959_initial.down,
    name: '20260905_201959_initial',
  },
  {
    up: migration_20260905_215006_hero_animation.up,
    down: migration_20260905_215006_hero_animation.down,
    name: '20260905_215006_hero_animation',
  },
  {
    up: migration_20260905_223619_rounded.up,
    down: migration_20260905_223619_rounded.down,
    name: '20260905_223619_rounded',
  },
  {
    up: migration_20260905_225343_hero_photo_rounded.up,
    down: migration_20260905_225343_hero_photo_rounded.down,
    name: '20260905_225343_hero_photo_rounded'
  },
];
