# React Zorm

Type safe `<form>` for React using [Zod](https://github.com/colinhacks/zod)!

Tools for creating type safe forms using the browser native `<form>` and
`FormData` with React.js and Zod.

Features / opinions

-   No controlled inputs
-   No React components, just a React hook
-   Validation on the client and the server
    -   When your server supports `FormData` like [Remix!](https://remix.run/)
-   Nested / array / object fields
-   Tiny: Less than 3kb (minified & gzipped, not including Zod)
-   Type safe
    -   `name` and `id` attribute generation
    -   Error referencing

## Install

```
npm install react-zorm
```

## Example

Also on [Codesandbox!](https://codesandbox.io/s/react-zorm-signup-form-example-inlub)

```tsx
import { z } from "zod";
import { createValidator } from "react-zorm";

const FormValues = z.object({
    email: z.string().min(1),
    password: z.string().min(8),
});

const { useValidation, fields } = createValidator("signup", FormValues);

function Signup() {
    const { validation, props, errors } = useValidation();

    return (
        <form
            {...props({
                // custom form props
                onSubmit(e) {},
            })}
        >
            Email:
            <input
                type="text"
                // Generate name attribute by calling the method
                name={fields.email()}
                // Add "errored" class when the field has an validation error
                className={errors.email("errored")}
            />
            {errors.email((e) => (
                // Rendered when the field has an error
                <ErrorMessage message={e.message} />
            ))}
            Password:
            <input
                type="password"
                name={fields.password()}
                className={errors.password("errored")}
            />
            {errors.password((e) => (
                <ErrorMessage message={e.message} />
            ))}
            <button type="submit">Signup!</button>
        </form>
    );
}
```

Also checkout [this classic TODOs example][todos] demonstrating almost every feature in the library.

## Objects

Create a Zod type with a nested object

```tsx
const FormValues = z.object({
    user: z.object({
        email: z.string().min(1),
        password: z.string().min(8),
    }),
});
```

and just create the input names with `.user.`:

```tsx
<input type="text" name={fields.user.email()} />;
<input type="password" name={fields.user.password()} />;
```

And all this is type checked 👌

## Arrays

Array of user objects for example:

```tsx
const FormValues = z.object({
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
            <input type="text" name={fields.users(index).email()} />
            <input type="password" name={fields.users(index).password()} />
        </>
    );
});
```

See the [TODOs example][todos] for more deatails

## Server-side validation

This is Remix but React Zorm does not actually use any Remix APIs so this method
can be adapted for example to Cloudflare Workers and any other tools using the
web platform APIs.

```tsx
import { parseForm } from "react-zorm";

export let action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    // Get validated and typed form object. This throw on validation errors.
    const data = parseForm(FormValues, form);
};
```

## API

### `createValidator(formName: string, formParser: ZodObject): Validator`

Create a form `Validator`

## `Validator` properties

-   `fields`: Chainable object for generating input `name`s and `id`s
    -   Call without arguments or with `.prop("name")` to generate the input name attribute value
    -   Call `.prop("id")` to generate a unique HTML id. Use for `aria-describedby` for example
-   `useValidation(): ValidationObject`: React hook for using the validator with a `<form>`
-   `useValidationContext(): ValidationContextObject`: React hook for using the validator from nested components

## `ValidationObject` properties

-   `props(customize: HTMLFormElement): HTMLFormElementProperties`: Get spreadable props for `<form>`
-   `validation`: The current Zod validation status returned by [`safeParse()`](https://github.com/colinhacks/zod/blob/cc8ad1981ba580d1250520fde8878073d4b7d40a/README.md#safeparse)
    -   The validation started on the first submit and after that on every input blur event
-   `validate(): void`: Manually invoke validation
-   `Context`: Context React component for providing the value for `useValidationContext()`

[todos]: https://codesandbox.io/s/react-zorm-todos-form-example-ss5c6?file=/src/App.tsx
