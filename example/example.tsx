import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { z } from "zod";
import { createFormValidator } from "../src/react-hook";

const FormValues = z.object({
    listName: z.string().min(1),
    todos: z.array(
        z.object({
            task: z.string().min(1),
            priority: z
                .string()
                .refine(
                    (val) => {
                        return /^[0-9]+$/.test(val.trim());
                    },
                    { message: "must use  positive numbers" },
                )
                .transform((s) => {
                    return Number(s);
                }),
            tags: z.array(z.string()).optional(),
        }),
    ),
});

const { useValidation, useValidationContext, fields } = createFormValidator(
    "todo-list",
    FormValues,
);

function TodoItem(props: { index: number }) {
    const { errors } = useValidationContext();

    return (
        <fieldset>
            Task <br />
            <input
                type="text"
                name={fields.todos(props.index).task()}
                className={errors.todos(props.index).task("error")}
            />
            {errors.todos(props.index).task((e) => e.code + " code")}
            <br />
            Priority <br />
            <input
                type="text"
                name={fields.todos(props.index).priority()}
                className={errors.todos(props.index).priority("error")}
            />
            {errors.todos(props.index).priority((e) => e.message + "dsf")}
        </fieldset>
    );
}

function TodoList() {
    const { validation, Context, props, errors } = useValidation();
    const canSubmit = !validation || validation?.success === true;
    const [todos, setTodos] = useState(1);
    const addTodo = () => setTodos((n) => n + 1);

    const range = Array(todos)
        .fill(0)
        .map((_, i) => i);

    return (
        <Context>
            <form
                {...props({
                    onSubmit(e) {
                        e.preventDefault();
                        if (validation?.success) {
                            alert("Form ok!");
                        }
                    },
                })}
            >
                <h1>List name</h1>
                <br />
                <input
                    type="text"
                    name={fields.listName()}
                    className={errors.listName("error")}
                />
                {errors.listName((e) => e.message)}

                <h2>Todos</h2>
                {range.map((index) => (
                    <TodoItem key={index} index={index} />
                ))}
                <button type="button" onClick={addTodo}>
                    Add todo
                </button>
                <div>
                    <button disabled={!canSubmit} type="submit">
                        Submit all
                    </button>
                </div>
                <pre>{JSON.stringify(validation, null, 2)}</pre>
            </form>
        </Context>
    );
}

ReactDOM.render(<TodoList />, document.getElementById("app"));
