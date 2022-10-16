## v0.6.0

2022-10-16

-   Publish as ESM to npm with the `"exports"` field
    -   Dual packaging. CommonJS code is also published as previously.
-   `zod` and `react` are now correctly peer deps
-   There should no behavioral changes. Only the packaging is improved to enable
    tree shaking etc.
-   Test against React.js 18 in strict mode
-   Add Playwright test
-   Run tests in Github actions
-   Upgrade build and test deps
-   Test with latest Zod

All changes https://github.com/esamattis/react-zorm/compare/react-zorm/v0.5.1...react-zorm/v0.6.0

## v0.5.1

2022-07-05

-   Add useValue() test for `<select>` [03758cb](https://github.com/esamattis/react-zorm/commit/03758cb) - Esa-Matti Suuronen
-   Add supports for select to useValue [5b1c2ed](https://github.com/esamattis/react-zorm/commit/5b1c2ed) - Giuseppe

All changes https://github.com/esamattis/react-zorm/compare/react-zorm/v0.5.0...react-zorm/v0.5.1

## v0.5.0

2022-07-01

Add support for lazily created form DOM elements. Fixes
[#15](https://github.com/esamattis/react-zorm/issues/15).

## Breaking Changes!

If you use the `useValue()` hook or the `<Value>` component or if you accessed
the DOM element via `zo.ref`.

The `zo.ref` is now a callback ref but the object ref is available at `ref.refObject`.

## Migration

`useValue()`:

```ts
const value = useValue({ form: zo.ref, name: zo.fields.input() });
```

to

```ts
const value = useValue({ zorm: zo, name: zo.fields.input() });
```

`<Value>`:

```tsx
<Value form={zo.ref} name={zo.fields.input()}>
    {(value) => <span>Input value: {value}</span>}
</Value>
```

to

```tsx
<Value zorm={zo} name={zo.fields.input()}>
    {(value) => <span>Input value: {value}</span>}
</Value>
```

All changes https://github.com/esamattis/react-zorm/compare/react-zorm/v0.4.0...react-zorm/v0.5.0

## v0.4.0

2022-06-04

-   Add render function support [b82a268](https://github.com/esamattis/react-zorm/commit/b82a268) - Esa-Matti Suuronen
-   Test with Zod 3.17.3 [e1b5507](https://github.com/esamattis/react-zorm/commit/e1b5507) - Esa-Matti Suuronen

## v0.3.2

2022-05-23

-   Add support z.date() [97276fc](https://github.com/esamattis/react-zorm/commit/97276fc) - Esa-Matti Suuronen

## v0.3.1

2022-04-27

-   Always update the onValidSubmit callback [89de1ff](https://github.com/esamattis/react-zorm/commit/89de1ff) - Esa-Matti Suuronen
-   Extract arrayEquals [9134285](https://github.com/esamattis/react-zorm/commit/9134285) - Esa-Matti Suuronen

## v0.3.0

2022-04-10

Adds support for "custom issues" which can be used for server-side field
validation on any JavaScript server.

Small changes:

-   Add declaration maps to npm [54d6daf](https://github.com/esamattis/react-zorm/commit/54d6daf) - Esa-Matti Suuronen
    -   Enabled cmd+click navigation in VSCode directly to the react-zorm source
-   Remove broken remix tests [294eccc](https://github.com/esamattis/react-zorm/commit/294eccc) - Esa-Matti Suuronen
-   Remove unused value chain [323026e](https://github.com/esamattis/react-zorm/commit/323026e) - Esa-Matti Suuronen

## v0.2.3

2022-02-09

-   Add `useValue()` and `<Value>`

## v0.2.2

2022-02-08

-   fix ssr crash

## v0.2.1

2022-02-07

-   Ensure no sparse arrays (avoids Zod crash)
-   Better handling for .optional() and .nullish()
-   Add sources maps to the npm package

## v0.2.0

2022-02-06

-   Remove `.props()`. There's only `.ref` now which is used to setup the event listeners
-   Pass `setupListeners: false` to disable the default validating behaviour via the event listeners
-   Remove old prototype API
-   More tests

## v0.1.6

2022-02-03

-   Add onValidSubmit

## v0.1.5

2022-02-02

-   Add support for getting array validation

## v0.1.4

2022-02-01

-   Remove ?? usage
-   Add array tests
-   Allow dependent root field validation
-   Add contributing.md

## v0.1.3

2022-02-01

-   Add support for dependent field validation via Zod `.refine()`
-   Add support for errors in any object

## v0.1.2

2022-02-01

-   Add readme and link to npm

## v0.1.1

2022-01-31

-   Fix fields chain return value [e93542a](https://github.com/esamattis/react-zorm/commit/e93542a) - Esa-Matti Suuronen

## v0.1.0

2022-01-31

-   New API with `useZorm()`
-   The old one is still there if you were quick enough to use it 😅
