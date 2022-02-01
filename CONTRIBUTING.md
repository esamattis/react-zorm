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

Run tests

```
cd packages/react-zorm
pnpm test
```

Hack around? Write tests and send you PR!

## Examples

Start the watcher in the react-zorm package

```
cd packages/react-zorm
pnpm run watch
```

Go to the examples and start one those

```
cd packages/examples
pnpm run example-signup
# or
pnpm run example-todos
```

[pnpm]: https://pnpm.io/
