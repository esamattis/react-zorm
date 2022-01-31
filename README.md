# React Zorm

Type safe `<form>` for React using [Zod](https://github.com/colinhacks/zod)!

Tools for creating type safe forms using the browser native `<form>` and
`FormData` with React.js and Zod.

Features / opinions

-   No controlled inputs
-   No React components, just a React hook
-   Validation on the client [and the server](#server-side-validation)
    -   When your server supports `FormData` like [Remix!](https://remix.run/)
-   Nested / array / object fields
-   Tiny: Less than 3kb (minified & gzipped, not including Zod)
-   Type safe
    -   `name` and `id` attribute generation
    -   Error referencing

If you enjoy this lib a Twitter shout-out
[@esamatti](https://twitter.com/esamatti) is always welcome! 😊

## Install

```
npm install react-zorm
```

## Example

Also on [Codesandbox!](https://codesandbox.io/s/react-zorm-signup-form-example-inlub)

```tsx
import { z } from "zod";
import { useZorm } from "react-zorm";

const FormSchema = z.object({
    email: z.string().min(1),
    password: z.string().min(8),
});

function Signup() {
    const zo = useZorm("signup", FormSchema);

    return (
        <form
            {...zo.props({
                // Zorm assigns onSubmit and onBlur.
                // Add your handlers here if you need them
                onSubmit() {},
                onBlur() {},
            })}
        >
            Email:
            <input
                type="text"
                // Generate name attribute by invoking the field on the "fields chain"
                name={zo.fields.email()}
                // Add "errored" class when the field has a validation error by
                // invoking the "errors chain".
                // This is convenience for .email() ? "errored" : undefined
                className={zo.errors.email("errored")}
            />
            {zo.errors.email((e) => (
                // Use function for streamlined error message rendering
                <ErrorMessage message={e.message} />
            ))}
            Password:
            <input
                type="password"
                name={fields.password()}
                className={errors.password("errored")}
            />
            {zo.errors.password((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <button type="submit">Signup!</button>
        </form>
    );
}
```

Also checkout [this classic TODOs example][todos] demonstrating almost every feature in the library.

## Nested data

### Objects

Create a Zod type with a nested object

```tsx
const FormSchema = z.object({
    user: z.object({
        email: z.string().min(1),
        password: z.string().min(8),
    }),
});
```

and just create the input names with `.user.`:

```tsx
<input type="text" name={zo.fields.user.email()} />;
<input type="password" name={zo.fields.user.password()} />;
```

### Arrays

Array of user objects for example:

```tsx
const FormSchema = z.object({
    users: z.array(
        z.object({
            email: z.string().min(1),
            password: z.string().min(8),
        }),
    ),
});
```

and put the array index to `users(index)`:

```tsx
users.map((user, index) => {
    return (
        <>
            <input type="text" name={zo.fields.users(index).email()} />
            <input type="password" name={zo.fields.users(index).password()} />
        </>
    );
});
```

And all this is type checked 👌

See the [TODOs example][todos] for more details

## The Chains

The chains are a way to access the form validation state in a type safe way. The
invocation via `()` is the way the get the chain data. The `fields` chain is for
the field `name` and `id` attributes and the `errors` chain is for getting the
possible error data with convenience overloads for rendering and setting class
names.

### `fields` invocation

Return values for different invocation types

-   `("name"): string` - The `name` attribute value
-   `("id"): string` - Unique `id` attribute value to be used with `aria-describedby`
-   `(): string` - The default, same as `"name"`
-   `(index: number): Chain` - Special case for setting array index

### `errors` invocation

-   `(): ZodIssue | null` - Possible ZodIssue object
-   `(str: string): string | undefined` - Return the passed string on error
-   `(render: (issue: ZodIssue) => any): any` - Invoke the passed function and return its return value

## Server-side validation

This is Remix but React Zorm does not actually use any Remix APIs so this method
can be adapted for example to Cloudflare Workers and any other tools using the
web platform APIs.

```tsx
import { parseForm } from "react-zorm";

export let action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    // Get validated and typed form object. This throw on validation errors.
    const data = parseForm(FormSchema, form);
};
```

## When Zorm validates?

When the form submits and on blurs after the first submit attempt.

If you want total control over this, just don't spread the `props()`, but set
the `ref` and call `validate()` manually when you need. Note that then you
need to manually prevent submitting when the form is invalid.

```tsx
function Signup() {
    const zo = useZorm("signup", FormSchema);

    return (
        <form
            ref={zo.ref}
            onSubmit={(e) => {
                const validation = zo.validate();

                if (!validation.success) {
                    e.preventDefault();
                }
            }}
        >
            ...
        </form>
    );
}
```

## API

Tools available for importing from `"react-zorm"`

### `useZorm(formName: string, schema: ZodObject): Zorm`

Create a form `Validator`

#### `Zorm` properties

-   `ref`: HTMLFormElement ref
-   `props(overrides: Props)`: Get spreadable props for `<form>`
-   `validation: SafeParseReturnType | null`: The current Zod validation status
    returned by
    [`safeParse()`][safeparse]
-   `validate(): SafeParseReturnType`: Manually invoke validation
-   `fields: FieldChain`: The fields chain
-   `errors: ErrorFieldChain`: The error chain

### `Zorm` Type

The type of the object returned by `useZorm()`. This type object can be used to
type component props if you want to split the form to multiple components and
pass the `zorm` object around.

```ts
import type { Zorm } from "react-zorm";

function MyForm() {
    const zo = useZorm("signup", FormSchema);

    return (
        // ...
        <SubComponent zorm={zo} />
        //..
    );
}

function SubComponent(props: { zorm: Zorm<typeof FormSchema> }) {
    // ...
}
```

### `parseForm(form: HTMLFormElement | FormData, schema: ZodObject): Type<ZodObject>`

Parse `HTMLFormElement` or `FormData` with the given Zod schema.

### `safeParseForm(form, schame): SafeParseReturnType`

Like `parseForm()` but uses the [`safeParse()`][safeparse] method from Zod.

[todos]: https://codesandbox.io/s/react-zorm-todos-form-example-ss5c6?file=/src/App.tsx
[safeparse]: https://github.com/colinhacks/zod/blob/cc8ad1981ba580d1250520fde8878073d4b7d40a/README.md#safeparse
