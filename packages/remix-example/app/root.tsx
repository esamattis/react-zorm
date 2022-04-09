import type { MetaFunction } from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";

import styles from "./styles.css";

export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "React Zorm Examples in Remix",
    viewport: "width=device-width,initial-scale=1",
});

export function links() {
    return [{ rel: "stylesheet", href: styles }];
}

export default function App() {
    return (
        <html lang="en">
            <head>
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
