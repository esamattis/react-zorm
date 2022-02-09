import "./styles.css";
import React, { useState } from "react";

import { z } from "zod";
import { useZorm, Zorm } from "react-zorm";

const FormSchema = z.object({
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

function renderError(props: { message: string }) {
    return <div className="error-message">{props.message}</div>;
}

function TodoItem(props: { zorm: Zorm<typeof FormSchema>; index: number }) {
    const todoError = props.zorm.errors.todos(props.index);
    const todoField = props.zorm.fields.todos(props.index);

    return (
        <fieldset>
            Task
            <input
                type="text"
                name={todoField.task()}
                className={todoError.task("errored")}
            />
            {todoError.task(renderError)}
            Priority
            <input
                type="text"
                name={todoField.priority()}
                className={todoError.priority("errored")}
            />
            {todoError.priority(renderError)}
        </fieldset>
    );
}

export default function TodoList() {
    const zo = useZorm("todos", FormSchema, {
        onValidSubmit(event) {
            event.preventDefault();
            alert(JSON.stringify(event.data, null, 2));
        },
    });

    const canSubmit = zo.validation?.success !== false;
    const [todos, setTodos] = useState(1);
    const addTodo = () => setTodos((n) => n + 1);

    const range = Array(todos)
        .fill(0)
        .map((_, i) => i);

    return (
        <form ref={zo.ref}>
            <h1>Todo List</h1>
            List name
            <input
                type="text"
                name={zo.fields.meta.listName()}
                className={zo.errors.meta.listName("errored")}
            />
            {zo.errors.meta.listName(renderError)}
            <h2>Todos</h2>
            {range.map((index) => (
                <TodoItem key={index} index={index} zorm={zo} />
            ))}
            <button type="button" onClick={addTodo}>
                Add todo
            </button>
            <button disabled={!canSubmit} type="submit">
                Submit all
            </button>
            <pre>
                Validation status: {JSON.stringify(zo.validation, null, 2)}
            </pre>
        </form>
    );
}
