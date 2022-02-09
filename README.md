# <img src="https://raw.githubusercontent.com/esamattis/react-zorm/master/react-zorm.svg?sanitize=true" height="60px"/> React Zorm

Type-safe `<form>` for React using [Zod](https://github.com/colinhacks/zod)!

Features / opinions

-   💎 Type-safe
    -   Get form data as a typed object
    -   Typo-safe `name` and `id` attribute generation
-   🤯 Simple nested object and array fields
    -   And still type-safe!
-   ✅ Validation on the client [and the server](#server-side-validation)
    -   Via FormData ([Remix](https://remix.run/)! 💜) and JSON
-   👍 Tiny: Less than 3kb (minified & gzipped, not including Zod)
-   🛑 No controlled inputs
    -   🚀 As performant as React form libraries can get!
-   🛑 No components, just a React hook
    -   🧳 Bring your own UI!
-   🛑 No internal form state. The form state is just in the `<form>`

If you enjoy this lib a Twitter shout-out
[@esamatti](https://twitter.com/esamatti) is always welcome! 😊

## Install

```
npm install react-zorm
```

## Example

Also on [Codesandbox!](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/signup?file=/src/App.tsx)

```tsx
import { z } from "zod";
import { useZorm } from "react-zorm";

const FormSchema = z.object({
    name: z.string().min(1),
    age: z
        .string()
        .regex(/^[0-9]+$/)
        .transform(Number),
});

function Signup() {
    const zo = useZorm("signup", FormSchema, {
        onValidSubmit(e) {
            e.preventDefault();
            alert("Form ok!\n" + JSON.stringify(e.data, null, 2));
        },
    });
    const disabled = zo.validation?.success === false;

    return (
        <form ref={zo.ref}>
            Name:
            <input
                type="text"
                name={zo.fields.name()}
                className={zo.errors.name("errored")}
            />
            {zo.errors.name((e) => (
                <ErrorMessage message={e.message} />
            ))}
            Age
            <input
                type="text"
                name={zo.fields.age()}
                className={zo.errors.age("errored")}
            />
            {zo.errors.age((e) => (
                <ErrorMessage message="Age must a number" />
            ))}
            <button disabled={disabled} type="submit">
                Signup!
            </button>
            <pre>Validation status: {JSON.stringify(zo.validation, null, 2)}</pre>
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
    // Get parsed and typed form object. This throw on validation errors.
    const data = parseForm(FormSchema, form);
};
```

## Using input values during rendering

The first tool you should reach is React. Just make the input controlled with
`useState()`. This works just fine with checkboxes, radio buttons and even with
text inputs when the form is small. React Zorm is not really interested how the
inputs get on the form. It just reads the `value` attributes using the
platform form APIs (FormData).

But if you have a larger form where you need to read the input value and you
find it too heavy to read it with just `useState()` you can use `useValue()`
from Zorm.

```ts
import { useValue } from "react-zorm";

function Form() {
    const zo = useZorm("form", FormSchema);
    const value = useValue({ form: zo.ref, name: zo.fields.input() });
    return <form ref={zo.ref}>...</form>;
}
```

`useValue()` works by subscribing to the input DOM events and syncing the value
to a local state. But this does not fix the performance issue yet. You need to
move the `useValue()` call to a subcomponent to avoid rendering the whole form
on every input change. See the [Zorm type](#zorm-type) docs on how to do
this.

Alternatively you can use the `<Value>` wrapper which allows access to the input
value via render prop:

```ts
import { Value } from "react-zorm";

function Form() {
    const zo = useZorm("form", FormSchema);
    return (
        <form ref={zo.ref}>
            <input type="text" name={zo.fields.input()} />
            <Value form={zo.ref} name={zo.fields.input()}>
                {(value) => <span>Input value: {value}</span>}
            </Value>
        </form>
    );
}
```

This way only the inner `<span>` element renders on the input changes.

Here's a
[codesandox demonstrating](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/use-value?file=/src/App.tsx)
these and vizualizing the renders.

## FAQ

### When Zorm validates?

When the form submits and on input blurs after the first submit attempt.

If you want total control over this, pass in `setupListeners: false` and call
`validate()` manually when you need. Note that now you need to manually prevent
submitting when the form is invalid.

```tsx
function Signup() {
    const zo = useZorm("signup", FormSchema, { setupListeners: false });

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

### How to handle 3rdparty components?

That do not create `<input>` elements?

Since Zorm just works with the native `<form>` you must sync their state to
`<input type="hidden">` elements in order for them to become actually part of
the form.

Here's a [Codesandbox example](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/3rdparty?file=/src/App.tsx) with `react-select`.

### How to validate dependent fields like password confirm?

See <https://twitter.com/esamatti/status/1488553690613039108>

### How to use checkboxes?

Checkboxes can result to simple booleans or arrays of selected values. These custom Zod types can help with them. See this [usage example](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/checkboxes?file=/src/App.tsx).

```ts
const booleanCheckbox = () =>
    z
        .string()
        // Unchecked checkbox is just missing so it must be optional
        .optional()
        // Transform the value to boolean
        .transform(Boolean);

const arrayCheckbox = () =>
    z
        .array(z.string().nullish())
        .nullish()
        // Remove all nulls to ensure string[]
        .transform((a) => (a ?? []).flatMap((item) => (item ? item : [])));
```

### How to do server-side validation without Remix?

If your server does not support parsing form data to the standard `FormData` you
can post the form as JSON and just use `.parse()` from the Zod schema. See the
next section for JSON posting.

### How to submit the form as JSON?

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

## API

Tools available for importing from `"react-zorm"`

### `useZorm(formName: string, schema: ZodObject, options?: UseZormOptions): Zorm`

Create a form `Validator`

#### param `formName: string`

The form name. This used for the input id generation so it should be unique
string within your forms.

#### param `schema: ZodObject`

Zod schema to parse the form with.

#### param `options?: UseZormOptions`

-   `onValidSubmit(event: ValidSubmitEvent): any`: Called when the form is submitted with valid data
    -   `ValidSubmitEvent#data`: The Zod parsed form data
    -   `ValidSubmitEvent#target`: The form HTML Element
    -   `ValidSubmitEvent#preventDefault()`: Prevent the default form submission
-   `setupListeners: boolean`: Do not setup any listeners. Ie. `onValidSubmit` won't be
    called nor the submission is automatically prevented. This gives total control
    when to validate the form. Set your own `onSubmit` on the form etc. Defaults to `true`.

#### return `Zorm`

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

### `useValue(subscription: ValueSubscription): string`

Get live raw value from the input.

#### `ValueSubscription`

-   `form: RefObject<HTMLFormElement>`: The form ref from `zo.ref`
-   `initialValue: string`: Initial value on the first and ssr render
-   `transform(value: string): any`: Transform the value before setting it to
    the internal state. The type can be also changed.

### `Value: React.Component`

Render prop version of the `useValue()` hook. The props are `ValueSubscription`.
The render prop child is `(value: string) => ReactNode`.

```tsx
<Value form={zo.ref} name={zo.fields.input()}>
    {(value) => <>value</>}
</Value>
```

### `parseForm(form: HTMLFormElement | FormData, schema: ZodObject): Type<ZodObject>`

Parse `HTMLFormElement` or `FormData` with the given Zod schema.

### `safeParseForm(form, schema): SafeParseReturnType`

Like `parseForm()` but uses the [`safeParse()`][safeparse] method from Zod.

[todos]: https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/todos?file=/src/App.tsx
[safeparse]: https://github.com/colinhacks/zod/blob/cc8ad1981ba580d1250520fde8878073d4b7d40a/README.md#safeparse
