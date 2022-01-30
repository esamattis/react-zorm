import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { z } from "zod";
import { createValidator } from "../../src/react-hook";

const FormValues = z.object({
    meta: z.object({
        listName: z.string().min(1),
    }),
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
        }),
    ),
});

const { useValidation, useValidationContext, fields } = createValidator(
    "todo-list",
    FormValues,
);

function renderError(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

function TodoItem(props: { index: number }) {
    const { errors } = useValidationContext();

    return (
        <fieldset>
            Task <br />
            <input
                type="text"
                name={fields.todos(props.index).task()}
                className={errors.todos(props.index).task("errored")}
            />
            {errors.todos(props.index).task(renderError)}
            <br />
            Priority <br />
            <input
                type="text"
                name={fields.todos(props.index).priority()}
                className={errors.todos(props.index).priority("errored")}
            />
            {errors.todos(props.index).priority(renderError)}
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
                <h1>Todo List</h1>
                List name
                <br />
                <input
                    type="text"
                    name={fields.meta.listName()}
                    className={errors.meta.listName("errored")}
                />
                {errors.meta.listName(renderError)}
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
                <pre>
                    Validation status: {JSON.stringify(validation, null, 2)}
                </pre>
            </form>
        </Context>
    );
}

ReactDOM.render(<TodoList />, document.getElementById("app"));
