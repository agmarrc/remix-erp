import { createCookieSessionStorage, redirect } from '@remix-run/node';
import bcrypt from 'bcrypt';
import { db } from "./db.server";

interface RegisterForm {
    name: string;
    email: string;
    password: string;
}

interface LoginForm {
    email: string;
    password: string;
};

export async function register({ name, email, password }: RegisterForm) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { name, email, passwordHash },
    });
    return { id: user.id, email };
  }

export async function login({ email, password }: LoginForm) {
    const user = await db.user.findUnique({
        where: { email },
    });
    if (!user) return null;

    const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isCorrectPassword) return null;

    return { id: user.id, email };
}



const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie: {
        name: "remix_erp_session",
        // normally you want this to be `secure: true`
        // but that doesn't work on localhost for Safari
        // https://web.dev/when-to-use-local-https/
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
});

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}