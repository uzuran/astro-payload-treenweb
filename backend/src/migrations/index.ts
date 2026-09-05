import * as migration_20260905_201959_initial from './20260905_201959_initial';
import * as migration_20260905_215006_hero_animation from './20260905_215006_hero_animation';

export const migrations = [
  {
    up: migration_20260905_201959_initial.up,
    down: migration_20260905_201959_initial.down,
    name: '20260905_201959_initial',
  },
  {
    up: migration_20260905_215006_hero_animation.up,
    down: migration_20260905_215006_hero_animation.down,
    name: '20260905_215006_hero_animation'
  },
];
