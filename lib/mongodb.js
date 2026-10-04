import "server-only";

import dns from "node:dns";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Set MONGODB_URI in .env.local before starting the app.");
}

// mongodb+srv URIs need a DNS SRV lookup. Some ISP/router resolvers hijack or drop those
// queries (querySrv ECONNREFUSED), so try reliable public resolvers first and keep the
// system resolvers as a fallback. Override with MONGODB_DNS_SERVERS="ip,ip" or "system".
if (uri.startsWith("mongodb+srv://") && process.env.MONGODB_DNS_SERVERS !== "system") {
  const preferred = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  dns.setServers([...new Set([...preferred, ...dns.getServers()])]);
}

const globalMongo = globalThis;
const client = globalMongo.mongoClient || new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalMongo.mongoClient = client;
}

const databaseName = process.env.MONGODB_DB || "bhashasetu";

export const mongoDatabase = client.db(databaseName);

export async function getMongoDatabase() {
  await client.connect();
  return mongoDatabase;
}
