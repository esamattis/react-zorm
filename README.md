# <img src="https://raw.githubusercontent.com/esamattis/react-zorm/master/react-zorm.svg?sanitize=true" height="60px"/> React Zorm

Type-safe `<form>` for React using [Zod](https://github.com/colinhacks/zod)!

Features / opinions

-   💎 Type-safe
-   🤯 Nested object and array fields
-   ✅ Validation on the client [and the server](#server-side-validation)
    -   Via FormData ([Remix](https://remix.run/)!) and JSON
-   👍 Tiny: Less than 3kb (minified & gzipped, not including Zod)
-   🛑 No controlled inputs
    -   🚀 As performant as React form libraries can get!
-   🛑 No components, just a React hook
    -   🧳 Bring your own UI!

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
    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
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
            <button type="submit" disabled={disabled}>
                Signup!
            </button>
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

The chains are a way to access the form validation state in a type safe way.
The invocation via `()` returns the chain value. On the `fields` chain the value is the `name` input attribute
and the `errors` chain it is the possible ZodIssue object for the field.

There few other option for invoking the chain:

### `fields` invocation

Return values for different invocation types

-   `("name"): string` - The `name` attribute value
-   `("id"): string` - Unique `id` attribute value to be used with labels and `aria-describedby`
-   `(): string` - The default, same as `"name"`
-   `(index: number): FieldChain` - Special case for setting array indices

### `errors` invocation

-   `(): ZodIssue | undefined` - Possible ZodIssue object
-   `(value: T): T | undefined` - Return the passed value on error. Useful for
    setting class names for example
-   `(value: typeof Boolean): boolean` - Return `true` when there's an error and `false`
    when it is ok. Example `.field(Boolean)`.
-   `<T>(render: (issue: ZodIssue) => T): T | undefined` - Invoke the passed
    function with the `ZodIssue` and return its return value. When there's no error
    a `undefined` is returned. Useful for rendering error message components
-   `(index: number): ErrorChain` - Special case for accessing array elements

## Server-side validation

This is Remix but React Zorm does not actually use any Remix APIs so this method
can be adapted for example to Cloudflare Workers and any other tools using the
web platform APIs (`FormData`).

```tsx
import { parseForm } from "react-zorm";

export let action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    // Get validated and typed form object. This throw on validation errors.
    const data = parseForm(FormSchema, form);
};
```

Not using Remix? No problem! Use JSON. Check [this out](#how-to-do-server-side-validation-without-remix).

## API

Tools available for importing from `"react-zorm"`

### `useZorm(formName: string, schema: ZodObject, options?: UseZormOptions): Zorm`

Create a form `Validator`

#### `UseZormOptions`

-   `onValidSubmit(event: ValidSubmitEvent): any`: Called when the form is submitted with valid data
    -   `ValidSubmitEvent#data`: Zod validated and parsed data
    -   `ValidSubmitEvent#target`: The form HTML Element
    -   `ValidSubmitEvent#preventDefault()`: Prevent the default form submission
-   `setupListeners: boolean`: Do not setup any listeners. Ie. `onValidSubmit` won't be
    called nor the submission is automatically prevented. This give total control
    when to validate the form. Set your own `onSubmit` on the form etc. Default to `true`.

#### `Zorm` properties

-   `ref`: HTMLFormElement ref for the `<form>` element
-   `validation: SafeParseReturnType | null`: The current Zod validation status
    returned by
    [`safeParse()`][safeparse]
-   `validate(): SafeParseReturnType`: Manually invoke validation
-   `fields: FieldChain`: The fields chain
-   `errors: ErroChain`: The error chain

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

### `safeParseForm(form, schema): SafeParseReturnType`

Like `parseForm()` but uses the [`safeParse()`][safeparse] method from Zod.

[todos]: https://codesandbox.io/s/react-zorm-todos-form-example-ss5c6?file=/src/App.tsx
[safeparse]: https://github.com/colinhacks/zod/blob/cc8ad1981ba580d1250520fde8878073d4b7d40a/README.md#safeparse

## FAQ

### When Zorm validates?

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

### How to handle controlled components?

See <https://twitter.com/esamatti/status/1488785537309847558>

### How to validate dependent fields like password confirm?

See <https://twitter.com/esamatti/status/1488553690613039108>

### How to do server-side validation without Remix?

If your server does not support parsing form data to the standard `FormData` you
can post the form as JSON and just use `.parse()` from the Zod schema. See the
next section for JSON posting.

### How submit the form as JSON?

Prevent the default submission in `onValidSubmit()` and use `fetch()`:

```ts
const zo = useZorm("todos", FormSchema, {
    onValidSubmit: async (event) => {
        event.preventDefault();
        await fetch("/api/form-handler", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(event.data),
        });
    },
});
```

If you need loading states [React Query][react-query] mutations can be cool:

```ts
import { useMutation } from "react-query";

// ...

const formPost = useMutation((data) => {
    return fetch("/api/form-handler", {
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
});

const zo = useZorm("todos", FormSchema, {
    onValidSubmit: async (event) => {
        event.preventDefault();
        formPost.mutate(event.data);
    },
});

return formPost.isLoading ? "Sending..." : null;
```

[react-query]: https://react-query.tanstack.com/
