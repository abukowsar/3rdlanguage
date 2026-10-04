import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { mongoDatabase } from "./mongodb";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("Set BETTER_AUTH_SECRET before starting the app.");
}

// Vercel exposes the deployment's own hostnames; trust them so sign-up/sign-in from
// 3rdlanguage.vercel.app (and preview URLs) isn't rejected as INVALID_ORIGIN.
const vercelOrigins = [
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_URL,
]
  .filter(Boolean)
  .map((host) => `https://${host}`);

// A localhost BETTER_AUTH_URL copied into Vercel would break auth there, so fall back
// to the production hostname when running on Vercel.
const configuredURL = process.env.BETTER_AUTH_URL;
const baseURL =
  process.env.VERCEL && (!configuredURL || /localhost|127\.0\.0\.1/.test(configuredURL))
    ? vercelOrigins[0]
    : configuredURL;

export const auth = betterAuth({
  baseURL,
  trustedOrigins: [...new Set([baseURL, ...vercelOrigins].filter(Boolean))],
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