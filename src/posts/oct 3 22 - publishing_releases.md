# Publishing Releases

## Reasoning

Publishing releases of projects can be a little cumbersome using
Github's built in release mechanism. You have to upload the files
manually and select crap from a dropdown. I'd rather just have
them on a `release` branch. I tried it, and so far it's working
well.

## Building A Release

Instead of having some `build.sh` script clutter up my project
root, I just add the build steps to `package.json`:

The main points here are that I'm building everything to a `dist`
folder which is what will be in our release, and then running all
steps in order with a final `build` command that uses
`npm-run-all`.

```js
  "scripts": {
    // ...
    "build:make-dist": "mkdir -p dist",
    "build:add-hashbang": "echo '#! /usr/bin/env node\n' > dist/make_cuts",
    "build:compile-imba": "imbac -p make_cuts.imba >> dist/make_cuts",
    "build:copy-lua": "cp main.lua dist/",
    "build:copy-package.json": "cp package.json dist/",
    "build": "npm exec npm-run-all build:*",
    // ...
  }
```

We then use `gh-pages` to release our `dist` to a separate
branch:

```js
  "scripts": {
    // ...
    "release": "npm run build && npx gh-pages --branch release --dist dist/ --message $npm_package_version"
    // ...
  }
```

As you can see, we're using the `$npm_package_version` as our commit message.
As such, you need to tick the version before releasing.
To do so we can use `npm version`:

```sh
npm version patch # 0.0.1 -> 0.0.2
npm version minor # 0.1.0 -> 0.2.0
npm version major # 1.0.0 -> 2.0.0
```
