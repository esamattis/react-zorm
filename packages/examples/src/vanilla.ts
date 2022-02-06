import { z } from "zod";
import { fieldChain, safeParseForm } from "@zorm/form";

const Schema = z.object({
    user: z.object({
        fullName: z.string().min(1),
        email: z.string().min(1),
    }),
});

const chain = fieldChain("form", Schema);

document.getElementById("app")!.innerHTML = `
    <form>

        Full name:
        <input name="${chain.user.fullName()}" type="text" />

        Email:
        <input name="${chain.user.email()}" type="text" />

        <button>Submit</button>

    </form>
`;

document.addEventListener("submit", (e) => {
    e.preventDefault();

    if (e.target instanceof HTMLFormElement) {
        const res = safeParseForm(e.target, Schema);
        alert(JSON.stringify(res, null, 2));
    }
});
