# Release Notes

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.4.0](https://github.com/programinglive/zettly-editor/compare/v0.3.0...v0.4.0) (2026-11-14)


### ✅ Tests

* update README.md, example/src/app.tsx, example/vite.config.ts +13 more ([7649092](https://github.com/programinglive/zettly-editor/commit/7649092f0eabd2067c3e0c2efde8428c185760d1))


### ♻️ Refactors

* **website:** text-only branding, page height reduction, and layout consolidation ([2b4a336](https://github.com/programinglive/zettly-editor/commit/2b4a336913dc404782a0ff69ff4f78fadc83e138))


### ✨ Features

* **m4:** headless document validator, ast codec, and analytics engine ([4086baa](https://github.com/programinglive/zettly-editor/commit/4086baaa8ba9a1df84e0407d63f8b2e977e64b8b))
* **m4:** react editor json interop and comprehensive documentation ([31fbfc7](https://github.com/programinglive/zettly-editor/commit/31fbfc7c092c3284281a3e2fb9c8d5f1b5a8fe3d))
* **m4:** standalone headless cli binary and multi-entry distribution ([c50a81e](https://github.com/programinglive/zettly-editor/commit/c50a81ef00c787673e02246803e1e06907287b15))
* **m4:** structured document schema types and declarative block descriptors ([5fdfd53](https://github.com/programinglive/zettly-editor/commit/5fdfd534e8ac9bee27b848101f1ffd19f536d3a7))
* **website:** professional compact interactive developer website revamp ([0542623](https://github.com/programinglive/zettly-editor/commit/0542623402488b71512983d879cf7cdb2c6fd575))


### 🧹 Chores

* **security,ci:** harden publish trigger, add PR CI, and remediate dev dependencies ([c44d83e](https://github.com/programinglive/zettly-editor/commit/c44d83ec9d5ecadccf834a5c923bc58e50ab908a))


### 🐛 Bug Fixes

* **ci:** build library before running CLI tests ([e96345a](https://github.com/programinglive/zettly-editor/commit/e96345ad38dc4ad7b99e917036d4474f835c60a7))
* **security:** sanitize prototype pollution keys in document attributes ([4c2afe6](https://github.com/programinglive/zettly-editor/commit/4c2afe64be7699dec91b05d0deaf918e5b909a96))
* **website:** align quickstart snippet and API props table with ZettlyEditorProps ([ee35f27](https://github.com/programinglive/zettly-editor/commit/ee35f275dd0e5c4419f02ee523e01e8dee81ace1))

## [0.3.0](https://github.com/programinglive/zettly-editor/compare/v0.2.19...v0.3.0) (2026-11-14)


### ✨ Features

* **m2:** implement medium-like clean writing experience and preset architecture ([52976fe](https://github.com/programinglive/zettly-editor/commit/52976febacc85ad6907f1e5c7eb2738e88a8c28c))

### [0.2.19](https://github.com/programinglive/zettly-editor/compare/v0.2.18...v0.2.19) (2026-11-14)


### 👷 Continuous Integration

* fail loudly when NPM_TOKEN is missing ([5443e14](https://github.com/programinglive/zettly-editor/commit/5443e143ff7489588a4a94dafcb5f3a0788ea1f4))
* publish with npm trusted publishing (OIDC), no token ([a4d4bb4](https://github.com/programinglive/zettly-editor/commit/a4d4bb40610d3cdae9bb09df9fd7f2332a53a122))


### 🧹 Chores

* add example:deploy script ([40bb82d](https://github.com/programinglive/zettly-editor/commit/40bb82d0cba4f7c74a73599610d69c8a3624fc41))
* cleanup post release ([ef0632b](https://github.com/programinglive/zettly-editor/commit/ef0632bcafcd2a6820022bb98dff035bc1422474))
* **governance:** add commitAll to versionrc to include release notes in release commit ([828626f](https://github.com/programinglive/zettly-editor/commit/828626f1c3598dcc1886494e698bfd214a462a64))
* **governance:** integrate M0 release lifecycle hook, fix contributing docs, and add AGENTS.md ([734e082](https://github.com/programinglive/zettly-editor/commit/734e082c2fe57e2c59821e4227750b7a0abc160e))
* **m1:** upgrade TipTap 3.34.0, resolve CVEs, add security regression tests, and fix packaging ([376de5d](https://github.com/programinglive/zettly-editor/commit/376de5d86b9ec3cf86edac22c5b7bf080b4d9441))

### [0.2.18](https://github.com/programinglive/zettly-editor/compare/v0.2.17...v0.2.18) (2026-01-21)


### 🧹 Chores

* fix ESLint 9 dependency conflicts and migrate to flat config ([1155a25](https://github.com/programinglive/zettly-editor/commit/1155a251bed038c3d5d116a6553e94d1702dd26a))
* resolve conflicts in package.json and package-lock.json and integrate remote changes ([7473017](https://github.com/programinglive/zettly-editor/commit/74730179131a4c185cccb56bc59f44d53ef2c0a6))
* update documentation 0.2.17 ([fa2fc68](https://github.com/programinglive/zettly-editor/commit/fa2fc68548e4805af9e6f40a2a3c1141c9279c17))
* update package-lock.json after npm update ([46005a6](https://github.com/programinglive/zettly-editor/commit/46005a6272d22595b495ec9e44bdd2a5df886146))
* upgrade dependencies to React 19, Tiptap 3, and Tailwind CSS 4 ([828889f](https://github.com/programinglive/zettly-editor/commit/828889f2c3168defca220b86b9646bcc4dc5d9eb))


### 📝 Documentation

* update integration tutorial for React 19, Tiptap 3, and Tailwind 4 ([340651b](https://github.com/programinglive/zettly-editor/commit/340651bb875d2dc03e70d1b51e4dd474ebc591d1))


### 🐛 Bug Fixes

* improve debug toggle visibility and add debug badge ([13d25f4](https://github.com/programinglive/zettly-editor/commit/13d25f4844a6e7b98421b75349f1e7bb0d386c56))

### [0.2.17](https://github.com/programinglive/zettly-editor/compare/v0.2.16...v0.2.17) (2025-12-09)


### 📝 Documentation

* add release notes for image upload feature ([1ee591d](https://github.com/programinglive/zettly-editor/commit/1ee591d9a1b714c25ee18bc3b7fcdbe7357b059b))


### ✅ Tests

* add vitest jsdom dom shims ([3c3a3f9](https://github.com/programinglive/zettly-editor/commit/3c3a3f947b69bd74b802e74dcee132871953b0ec))

### [0.2.16](https://github.com/programinglive/zettly-editor/compare/v0.2.15...v0.2.16) (2025-12-09)


### 📝 Documentation

* update release notes for v0.2.15 ([d38ccad](https://github.com/programinglive/zettly-editor/commit/d38ccad08ef249b33566989d43a75138db38fa7c))


### ✨ Features

* **image-upload:** add image upload, paste, and drag-drop support with toolbar integration ([e311a6e](https://github.com/programinglive/zettly-editor/commit/e311a6efd1346568acc01ff56280056a95879e98))

### [0.2.15](https://github.com/programinglive/zettly-editor/compare/v0.2.14...v0.2.15) (2025-12-05)


### 🧹 Chores

* separate changelog and release notes structure ([4e17325](https://github.com/programinglive/zettly-editor/commit/4e173251d67196c56c8457494bd0810ef837d08b))


### 📝 Documentation

* add initial product requirements document ([166373d](https://github.com/programinglive/zettly-editor/commit/166373d4c33c3e24c208980285d17a185b2b60ec))

### [0.2.14](https://github.com/programinglive/zettly-editor/compare/v0.2.13...v0.2.14) (2025-12-05)


### 🏗️ Build System

* configure release notes to generate in docs/release-notes folder ([4767b8c](https://github.com/programinglive/zettly-editor/commit/4767b8c907ca4e89ea0a9781ffe4126aafbd896d))


### 🧹 Chores

* update gitignore for netlify ([b1c6668](https://github.com/programinglive/zettly-editor/commit/b1c6668c575139322e74728fcb76357befaed9c3))

### [0.2.13](https://github.com/programinglive/zettly-editor/compare/v0.2.12...v0.2.13) (2025-10-24)


### 🐛 Bug Fixes

* improve toolbar mobile layout and add tests ([696cb57](https://github.com/programinglive/zettly-editor/commit/696cb574f90a62efb06289656e3eb8ac39b68b78))

### [0.2.12](https://github.com/programinglive/zettly-editor/compare/v0.2.11...v0.2.12) (2025-10-23)


### 📝 Documentation

* add 0.2.11 changelog entry ([5963bb7](https://github.com/programinglive/zettly-editor/commit/5963bb7958bb3424581790c991500f9664e93a42))


### ✨ Features

* add sentry integration ([7a9ed02](https://github.com/programinglive/zettly-editor/commit/7a9ed02d278f8a53e6b3d922c6c78c2d286d9deb))

### [0.2.11](https://github.com/programinglive/zettly-editor/compare/v0.2.10...v0.2.11) (2025-10-22)


### ✨ Features

* add light theme toolbar active state ([3d63fcd](https://github.com/programinglive/zettly-editor/commit/3d63fcdc5fe2782f7a8bfcc0a82a0edc6835743b))


### 💄 Styles

* **dark:** refine dropdown palette for heading menu ([13bb51b](https://github.com/programinglive/zettly-editor/commit/13bb51b5c47d54c3b5207b7fd7c7f317a0c5edac))


### [0.2.10](https://github.com/programinglive/zettly-editor/compare/v0.2.9...v0.2.10) (2025-10-22)


### 🐛 Bug Fixes

* guard heading portal rendering in non-browser environments ([08dc88a](https://github.com/programinglive/zettly-editor/commit/08dc88a12b448ccca7b323abe90543edcd2ef803))
* render heading menu in fixed layer to bypass parent stacking/overflow ([89096ba](https://github.com/programinglive/zettly-editor/commit/89096ba0b96b36b7b4302cf578eed677e4fdd8fd))

### [0.2.9](https://github.com/programinglive/zettly-editor/compare/v0.2.8...v0.2.9) (2025-10-22)


### 🐛 Bug Fixes

* style heading menu for light mode ([463c28f](https://github.com/programinglive/zettly-editor/commit/463c28faee169fe9e9fc34715b47ce0f7ed8ccce))

### [0.2.8](https://github.com/programinglive/zettly-editor/compare/v0.2.7...v0.2.8) (2025-10-22)


### 🐛 Bug Fixes

* adjust heading dropdown layering in light mode ([d0dff82](https://github.com/programinglive/zettly-editor/commit/d0dff82f7da8ea53642d2fc646ac12f1e722c8ce))

### [0.2.7](https://github.com/programinglive/zettly-editor/compare/v0.2.6...v0.2.7) (2025-10-22)


### 👷 Continuous Integration

* grant deployments permission for publish workflow ([cd096f5](https://github.com/programinglive/zettly-editor/commit/cd096f5ea0ad9c6fb9a321b83e1d54e83a2c100f))


### 🐛 Bug Fixes

* ensure highlight mark is visible and correct ESM export path ([20ccc19](https://github.com/programinglive/zettly-editor/commit/20ccc19f665b96dbfd447a3189f79fcf11df5c12))


### 📝 Documentation

* document single import helper ([7c1e4ab](https://github.com/programinglive/zettly-editor/commit/7c1e4ab24a6ee5669d186a7d8caea436566f0639))

### [0.2.6](https://github.com/programinglive/zettly-editor/compare/v0.2.5...v0.2.6) (2025-10-22)


### 📝 Documentation

* clarify quickstart steps and enable highlight command ([289f64c](https://github.com/programinglive/zettly-editor/commit/289f64ce081ea7e62b275b7a5422c1b7b2590930))


### 👷 Continuous Integration

* record deployments after publish workflow ([ff45133](https://github.com/programinglive/zettly-editor/commit/ff451333668fc484bd2a9deccdaa21d255d566bc))

### [0.2.5](https://github.com/programinglive/zettly-editor/compare/v0.2.4...v0.2.5) (2025-10-22)


### 🐛 Bug Fixes

* add version check to github packages publish step ([2bb16a2](https://github.com/programinglive/zettly-editor/commit/2bb16a22d85668f4f1b34ee6bd5989070022aa9f))

### [0.2.4](https://github.com/programinglive/zettly-editor/compare/v0.2.3...v0.2.4) (2025-10-22)


### 🧹 Chores

* polish marketing copy and docs ([5654b60](https://github.com/programinglive/zettly-editor/commit/5654b6057fea1a9e02b6f883436a90ed271ad4cb))

### [0.2.3](https://github.com/programinglive/zettly-editor/compare/v0.2.2...v0.2.3) (2025-10-22)


### 🐛 Bug Fixes

* skip npm publish if version already exists ([40858ac](https://github.com/programinglive/zettly-editor/commit/40858ac296b47acc516472908802e4cf4eac52cc))

### [0.2.2](https://github.com/programinglive/zettly-editor/compare/v0.2.0...v0.2.2) (2025-10-22)

## [0.2.0](https://github.com/programinglive/zettly-editor/compare/v0.1.24...v0.2.0) (2025-10-22)


### ✨ Features

* redesign toolbar with undo redo and heading dropdown ([c045888](https://github.com/programinglive/zettly-editor/commit/c045888c3a6e8e56815b1a17f7e33050cfd94562))

### [0.1.24](https://github.com/programinglive/zettly-editor/compare/v0.1.23...v0.1.24) (2025-10-22)


### ✨ Features

* add GitHub link and star badge to example navbar ([6ab51bc](https://github.com/programinglive/zettly-editor/commit/6ab51bc6adf12d382b9b4087040b307ab9f89323))

### [0.1.23](https://github.com/programinglive/zettly-editor/compare/v0.1.22...v0.1.23) (2025-10-20)

### [0.1.22](https://github.com/programinglive/zettly-editor/compare/v0.1.21...v0.1.22) (2025-10-20)


### ✨ Features

* add heading dropdown select in toolbar ([364bdb4](https://github.com/programinglive/zettly-editor/commit/364bdb4b88a47daf0e31ec493c386d6433d913ea))

### [0.1.21](https://github.com/programinglive/zettly-editor/compare/v0.1.20...v0.1.21) (2025-10-20)


### 🏗️ Build System

* expose styles export and update example ([a85036d](https://github.com/programinglive/zettly-editor/commit/a85036d551787b32838318a3cf1c02f7220d4d66))

### [0.1.20](https://github.com/programinglive/zettly-editor/compare/v0.1.19...v0.1.20) (2025-10-20)


### 🐛 Bug Fixes

* rename playground logo for case-sensitive builds ([ba5bf17](https://github.com/programinglive/zettly-editor/commit/ba5bf1701761896f624bb47e632ac7588e618f50))


### 👷 Continuous Integration

* trigger publish on tag push ([c187f3a](https://github.com/programinglive/zettly-editor/commit/c187f3a6678a443bce5f3b4b0ce775b0cc2065f9))

### [0.1.19](https://github.com/programinglive/zettly-editor/compare/v0.1.18...v0.1.19) (2025-10-20)


### 👷 Continuous Integration

* improve dual registry publish workflow ([9eee864](https://github.com/programinglive/zettly-editor/commit/9eee8645dbf566c178334c019ba92d5e4763311b))

### [0.1.18](https://github.com/programinglive/zettly-editor/compare/v0.1.17...v0.1.18) (2025-10-20)


### 👷 Continuous Integration

* publish also to github packages ([2ec9b8a](https://github.com/programinglive/zettly-editor/commit/2ec9b8ae52ee860e4a9e88a534d42d8bd9a02d12))

### [0.1.17](https://github.com/programinglive/zettly-editor/compare/v0.1.16...v0.1.17) (2025-10-20)


### 👷 Continuous Integration

* fix npm publish workflow token ([d2f3aa0](https://github.com/programinglive/zettly-editor/commit/d2f3aa0fb4edb24611287cd13b91279ee3da5fe9))

### [0.1.15](https://github.com/programinglive/zettly-editor/compare/v0.1.14...v0.1.15) (2025-10-20)

### [0.1.13](https://github.com/programinglive/zettly-editor/compare/v0.1.12...v0.1.13) (2025-10-20)


### ✨ Features

* add branding assets to example app ([d286f3a](https://github.com/programinglive/zettly-editor/commit/d286f3a4f4914beb8728595471675dfd1370b3e4))

### [0.1.12](https://github.com/programinglive/zettly-editor/compare/v0.1.11...v0.1.12) (2025-10-19)

### [0.1.11](https://github.com/programinglive/zettly-editor/compare/v0.1.10...v0.1.11) (2025-10-19)


### 🐛 Bug Fixes

* enable toolbar debug toggle without explicit handler ([0431b4b](https://github.com/programinglive/zettly-editor/commit/0431b4b17d30c09e10124770151a7afa36e97629))

### [0.1.10](https://github.com/programinglive/zettly-editor/compare/v0.1.9...v0.1.10) (2025-10-19)


### 📝 Documentation

* document debug toolbar toggle and editor footer ([8fab4a4](https://github.com/programinglive/zettly-editor/commit/8fab4a49f0f01bf32d5b7e33c61e4253a491a121))

### [0.1.9](https://github.com/programinglive/zettly-editor/compare/v0.1.8...v0.1.9) (2025-10-19)


### ✨ Features

* add debug toggle to toolbar and editor footer with version display ([3f362bb](https://github.com/programinglive/zettly-editor/commit/3f362bb7ab74051bdff1120d70d8eefbdcd1f1ae))

### [0.1.8](https://github.com/programinglive/zettly-editor/compare/v0.1.7...v0.1.8) (2025-10-19)


### ⚠ BREAKING CHANGES

* **debug:** None - all changes are additive and opt-in

### ✨ Features

* **debug:** add structured debug event system with remote capture support ([ebbfb4e](https://github.com/programinglive/zettly-editor/commit/ebbfb4e1a25dacc6b8f64db259cdfeb5819905d6))

### [0.1.7](https://github.com/programinglive/zettly-editor/compare/v0.1.6...v0.1.7) (2025-10-19)


### 🐛 Bug Fixes

* improve toolbar state updates and code block exit ([51b5a50](https://github.com/programinglive/zettly-editor/commit/51b5a50c60a8d1681417bb44446f09b94c5ac9fb))


### 💄 Styles

* **dark:** improve editor dark theme (surface, toolbar, buttons, links, code, blockquote) ([b3ae0b7](https://github.com/programinglive/zettly-editor/commit/b3ae0b747cf3fc6af889b12fcd1463df08f867fe))
* **dark:** refine playground heading and code block contrast ([97b82d3](https://github.com/programinglive/zettly-editor/commit/97b82d3f202bf466f8be49f880b4696ac20d31fb))

### [0.1.6](https://github.com/programinglive/zettly-editor/compare/v0.1.5...v0.1.6) (2025-10-19)


### 🐛 Bug Fixes

* ensure toolbar formatting commands work ([4db3972](https://github.com/programinglive/zettly-editor/commit/4db3972034691a3ecdc97e186eecf9746b52b762))

### [0.1.5](https://github.com/programinglive/zettly-editor/compare/v0.1.4...v0.1.5) (2025-10-18)


### 🐛 Bug Fixes

* ensure surface click focus and remove UA outline ([d9feee0](https://github.com/programinglive/zettly-editor/commit/d9feee05a33b2881943c48e44ab1fd9374f256d3))

### [0.1.4](https://github.com/programinglive/zettly-editor/compare/v0.1.3...v0.1.4) (2025-10-18)


### 🐛 Bug Fixes

* bundle editor base styles and surface focus ([011fba0](https://github.com/programinglive/zettly-editor/commit/011fba00aa14aef157fe244a014340abf5ed1e1d))
* reduce editor main-thread work and optimize example ([c8eba20](https://github.com/programinglive/zettly-editor/commit/c8eba2054b852f568286db2b1c780f088c75da00))

### [0.1.3](https://github.com/programinglive/zettly-editor/compare/v0.1.2...v0.1.3) (2025-10-18)

### [0.1.2](https://github.com/programinglive/zettly-editor/compare/v0.1.1...v0.1.2) (2025-10-18)


### 🐛 Bug Fixes

* normalize editor empty state on full clear ([872b3af](https://github.com/programinglive/zettly-editor/commit/872b3af002f6dbfa49a2ab030d78b83914cb48f5))

### [0.1.1](https://github.com/programinglive/zettly-editor/compare/v0.1.0...v0.1.1) (2025-10-18)


### 🐛 Bug Fixes

* widen editor surface and document new vite usage ([f06a276](https://github.com/programinglive/zettly-editor/commit/f06a2766f73788b17a9be59f1ddbe80c1a19a3f6))

## [0.1.0](https://github.com/programinglive/zettly-editor/compare/v0.0.5...v0.1.0) (2025-10-18)


### 🐛 Bug Fixes

* compat prepare script ([1654245](https://github.com/programinglive/zettly-editor/commit/16542453e9dd150aa3d2feb857c09e487a655755))
* remove node: protocol for legacy compat ([f9753cf](https://github.com/programinglive/zettly-editor/commit/f9753cfc3125b3b6daa3099599abd920e2ba3019))


### ✨ Features

* add syntax highlighting support ([a5da7b5](https://github.com/programinglive/zettly-editor/commit/a5da7b564f5779fef45ccf68e461376a7a04a10f))

### [0.0.5](https://github.com/programinglive/zettly-editor/compare/v0.0.4...v0.0.5) (2025-10-18)


### 🧹 Chores

* guard husky prepare ([2054b80](https://github.com/programinglive/zettly-editor/commit/2054b80ea2ac71c34a9a885ad27cb6118eae5a3d))

### [0.0.4](https://github.com/programinglive/zettly-editor/compare/v0.0.3...v0.0.4) (2025-10-18)


### 🧹 Chores

* add social metadata for deployment site ([41c10a2](https://github.com/programinglive/zettly-editor/commit/41c10a27c3025d4d9e89e63ba405158cf8b18669))

### [0.0.3](https://github.com/programinglive/zettly-editor/compare/v0.0.2...v0.0.3) (2025-10-18)


### 📝 Documentation

* note preview mode and sample formatting ([42186fd](https://github.com/programinglive/zettly-editor/commit/42186fd2928b42699db40070be12a65ad4310e4a))


### 🧹 Chores

* raise example bundle warning threshold ([3fe79a1](https://github.com/programinglive/zettly-editor/commit/3fe79a1f42f499d6d24e8a4101f3abac2c7140a8))

### [0.0.2](https://github.com/programinglive/zettly-editor/compare/v0.0.1...v0.0.2) (2025-10-18)


### 🐛 Bug Fixes

* improve list and link interactions ([250edd9](https://github.com/programinglive/zettly-editor/commit/250edd9e5e3827e83311f6388c1e19f25ad843f0))


### 💄 Styles

* tidy editor container and toolbar ([b6d7854](https://github.com/programinglive/zettly-editor/commit/b6d7854df273282f2a1509053cbdfd48a3123e76))


### ✨ Features

* **example:** add preview toggle ([5129ffe](https://github.com/programinglive/zettly-editor/commit/5129ffec6652451a1010fa7c5929ee522eb89fce))


### 📝 Documentation

* **example:** demonstrate toolbar features ([d3a3897](https://github.com/programinglive/zettly-editor/commit/d3a3897ccaaabcf4ac205e1ef5ce37a0841a63a4))

### 0.0.1 (2025-10-18)


### 🧹 Chores

* bootstrap zettly editor package ([0cda915](https://github.com/programinglive/zettly-editor/commit/0cda915c4a3d45b0c320167014a50021573003c6))
* **repo:** prepare open source collateral ([1e8cffb](https://github.com/programinglive/zettly-editor/commit/1e8cffb7d3045f90dddf571faaa39ded7ec7f87e))
