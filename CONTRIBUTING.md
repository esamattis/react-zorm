# Contributing

This is [pnpm][pnpm] monorepo. Maybe a bit overkill for such a small lib but eh, pnpm is
quite smooth with these.

So install pnpm and clone the repository

```
git clone https://github.com/esamattis/react-zorm.git
```

Install deps with pnpm

```
pnpm install --frozen-lockfile
```

## Tests

Run tests

```
cd packages/react-zorm
pnpm test
```

Playwright tests

```
cd packages/react-zorm
pnpm run playwright-test
```

To manually debug playwright tests start the script script

```
pnpm run dev
```

And run playwright as headed:

```
pnpm run playwright-test --headed
```

## Packaging

You need to run fork Zorm in your project you can build and package it:

```
cd packages/react-zorm
pnpm build
pnpm pack
```

This will generate a file like `react-zorm-0.6.0.tgz`. Add it to your project
git and install it:

```
npm install ./react-zorm-0.6.0.tgz
```

And it will be refenced by the `file:` protocol in your package.json.

[pnpm]: https://pnpm.io/
