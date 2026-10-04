import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { mongoDatabase } from "./mongodb";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("Set BETTER_AUTH_SECRET before starting the app.");
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(mongoDatabase),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "applicant",
        input: false,
      },
      applicantStatus: {
        type: "string",
        required: false,
        defaultValue: "pending",
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

// For public pages: treat an unreachable auth database as "signed out" instead of crashing.
export async function getOptionalSession() {
  try {
    return await getCurrentSession();
  } catch (error) {
    console.error("Unable to read the session; rendering as signed out:", error);
    return null;
  }
}