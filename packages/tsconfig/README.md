# @treenweb/tsconfig

Shared TypeScript config. `base.json` re-exports the repo-root
`tsconfig.base.json`; per-package `tsconfig.json` files extend
`@treenweb/tsconfig/base.json` and add their own `compilerOptions`
(JSX, lib, paths) + `include`.
