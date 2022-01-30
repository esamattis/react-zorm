# React Zorm

Type safe `<form>` for React using [Zod](https://github.com/colinhacks/zod)!

Tools for creating type safe forms using the browser native `<form>` and
`FormData` with React.js and Zod.

Features / opinions

-   Validation on the client and the browser
    -   When your server support `FormData` eg. [Remix!](https://remix.run/)
-   Nested / array fields
-   Object fields
-   No controlled inputs

## Install

```
npm install react-zorm
```

## Example

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
                // Render when the field has an error
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

Play with this example in Codesandbod.

Also checkout this classic TODOs demonstrating almost every feature in the library.

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

And this is all type checked 👌

## Arrays

Type with array of user objects

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

And put the array index `users(index)`:

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
