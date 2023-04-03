# <img src="https://raw.githubusercontent.com/esamattis/react-zorm/master/react-zorm.svg?sanitize=true" height="60px"/> React Zorm

Type-safe `<form>` for React using [Zod](https://github.com/colinhacks/zod)!

Features / opinions

-   🔥 NEW Automatic progressive HTML Attributes
    -   Docs and [feedback here](https://github.com/esamattis/react-zorm/discussions/48).
-   💎 Type-safe
    -   Get form data as a typed object
    -   Typo-safe `name` and `id` attribute generation
-   🤯 Simple nested object and array fields
    -   And still type-safe!
-   ✅ Validation on the client [and the server](#server-side-validation)
    -   With [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) or JSON
    -   Eg. works with any JavaScript backend
    -   Remix, Next.js, Express, Node.js, CF Workers, Deno etc.
-   📦 Tiny: Less than 3kb (minified & gzipped)
    -   🌳 Tree shakes to be even smaller!
    -   🤷 No dependencies, only peer deps for React and Zod
-   🛑 No controlled inputs or context providers required
    -   ☝️ The form is validated directly from the `<form>` DOM element
    -   🚀 As performant as React form libraries can get!

If you enjoy this lib a Twitter shout-out
[@esamatti](https://twitter.com/esamatti) is always welcome! 😊

You can also checkout my [talk at React Finland 2022](https://www.youtube.com/watch?v=tCyOdW4D6b8). [Slides](https://docs.google.com/presentation/d/1PEjVuK1vfV_VfJtSnYNHdTUExEUrAURTDALFZZCU2DU/edit?usp=sharing).

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
    password: z
        .string()
        .min(10)
        .refine((pw) => /[0-9]/.test(pw), "Password must contain a number"),
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
            Password:
            <input
                type="password"
                name={zo.fields.password()}
                className={zo.errors.password("errored")}
            />
            {zo.errors.password((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <button disabled={disabled} type="submit">
                Signup!
            </button>
            <pre>Validation status: {JSON.stringify(zo.validation, null, 2)}</pre>
        </form>
    );
}
```

Also checkout [this classic TODOs example][todos] demonstrating almost every feature in the library and if you are
in to Remix checkout [this server-side validation example][remix-example].

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

## Server-side validation

This is Remix but React Zorm does not actually use any Remix APIs so this method
can be adapted for any JavaScript based server.

```tsx
import { parseForm } from "react-zorm";

export let action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    // Get parsed and typed form object. This throws on validation errors.
    const data = parseForm(FormSchema, form);
};
```

### Server-side field errors

The `useZorm()` hook can take in any additional `ZodIssue`s via the `customIssues` option:

```ts
const zo = useZorm("signup", FormSchema, {
    customIssues: [
        {
            code: "custom",
            path: ["username"],
            message: "The username is already in use",
        },
    ],
});
```

These issues can be generated anywhere. Most commonly on the server. The error
chain will render these issues on the matching paths just like the errors coming
from the schema.

To make their generation type-safe react-zorm exports `createCustomIssues()`
chain to make it easy:

```ts
const issues = createCustomIssues(FormSchema);

issues.username("Username already in use");

const zo = useZorm("signup", FormSchema, {
    customIssues: issues.toArray(),
});
```

This code is very contrived but take a look at these examples:

-   [Rendering field errors from the Remix Action Functions][remix-example]
-   [Async validation via React Query](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/async-validation?file=/src/App.tsx)

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
-   `(fn: RenderFunction): any` -
    Calls the function with `{name: string, id: string, type: ZodType, issues: ZodIssue}` and renders the return value.
    -   Can be used to create resuable fields. [Codesandbox example](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/render-function?file=/src/App.tsx).

### `errors` invocation

-   `(): ZodIssue | undefined` - Possible ZodIssue object
-   `(value: T): T | undefined` - Return the passed value on error. Useful for
    setting class names for example
-   `(value: typeof Boolean): boolean` - Return `true` when there's an error and `false`
    when it is ok. Example `.field(Boolean)`.
-   `<T>(render: (issue: ZodIssue, ...otherIssues: ZodIssue[]) => T): T | undefined` -
    Invoke the passed function with the `ZodIssue` and return its return value.
    When there's no error a `undefined` is returned and the function will not be
    invoked. Useful for rendering error message components. One field can have
    multiple issues so to render them all you can use the spread operator
    `...issues`.
-   `(index: number): ErrorChain` - Special case for accessing array elements

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
    const value = useValue({ zorm: zo, name: zo.fields.input() });
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

Another more modern option is to use the formdata event. [Codesandbox
example](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/formdata-event?file=/src/App.tsx)

### How to validate dependent fields like password confirm?

See <https://twitter.com/esamatti/status/1488553690613039108>

### How to translate form error messages to other languages?

Use the `ZodIssue`'s `.code` properties to render corresponding error messages
based on the current language instead of just rendering the `.message`.

See this Codesandbox example:

<https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/internalization?file=/src/App.tsx>

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

### How to upload and validate files?

Use `z.instanceof(File)` for the file input type. See [this
Codesandox](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/file?file=/src/App.tsx:290-317)
for an example.

Native forms support files as is but if you need to POST as JSON you can turn
the file to a base64 for example. See
[`FileReader.readAsDataURL()`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL).
Or just post the file separately.

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
-   `customIssues: ZodIssue[]`: Any additional `ZodIssue` to be rendered within
    the error chain. This is commonly used to handle server-side field validation
-   `onFormData(event: FormDataEvent)`: Convinience callback for accessing the [formdata
    event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/formdata_event)
    because React does not support it directly on the in JSX. This can be used to modify
    the outgoing form without modifying the form on the DOM. See this [Codesandbox
    example](https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/formdata-event?file=/src/App.tsx) on how it can used to handle controlled components.

#### return `Zorm`

-   `ref`: A callback ref for the `<form>` element
-   `form`: The current form element set by the callback ref
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
<Value zorm={zo} name={zo.fields.input()}>
    {(value) => <>value</>}
</Value>
```

### `parseForm(schema: ZodObject, form: HTMLFormElement | FormData): Type<ZodObject>`

Parse `HTMLFormElement` or `FormData` with the given Zod schema.

### `safeParseForm(schema: ZodObject, form: HTMLFormElement | FormData): SafeParseReturnType`

Like `parseForm()` but uses the [`safeParse()`][safeparse] method from Zod.

[todos]: https://codesandbox.io/s/github/esamattis/react-zorm/tree/master/packages/codesandboxes/boxes/todos?file=/src/App.tsx
[safeparse]: https://github.com/colinhacks/zod/blob/cc8ad1981ba580d1250520fde8878073d4b7d40a/README.md#safeparse
[remix-example]: https://github.com/esamattis/react-zorm/blob/master/packages/remix-example/app/routes/server-side-validation.tsx
