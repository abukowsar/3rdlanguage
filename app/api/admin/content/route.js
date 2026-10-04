import { randomUUID } from "node:crypto";
import { getAdminAccess } from "@/lib/admin";
import { getMongoDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

const languages = new Set(["zh", "ja", "de", "ko", "ar"]);

function parsePage(value) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateContent(input) {
  const body = input && typeof input === "object" ? input : {};
  const content = {
    title: typeof body.title === "string" ? body.title.trim() : "",
    language: typeof body.language === "string" ? body.language : "",
    category: typeof body.category === "string" ? body.category.trim() : "",
    summary: typeof body.summary === "string" ? body.summary.trim() : "",
    body: typeof body.body === "string" ? body.body.trim() : "",
    published: body.published === true,
  };

  if (!content.title || content.title.length > 120) return "শিরোনাম ১ থেকে ১২০ অক্ষরের মধ্যে রাখুন।";
  if (!languages.has(content.language)) return "একটি সমর্থিত ভাষা বেছে নিন।";
  if (!content.category || content.category.length > 80) return "বিষয় ১ থেকে ৮০ অক্ষরের মধ্যে রাখুন।";
  if (content.summary.length > 320) return "সারাংশ ৩২০ অক্ষরের মধ্যে রাখুন।";
  if (!content.body || content.body.length > 15000) return "মূল লেখা ১ থেকে ১৫,০০০ অক্ষরের মধ্যে রাখুন।";
  return content;
}

export async function GET(request) {
  const access = await getAdminAccess();
  if (!access.session) {
    return Response.json({ error: "Admin access required." }, { status: access.status });
  }

  const searchParams = new URL(request.url).searchParams;
  const page = parsePage(searchParams.get("page"));
  const pageSize = [10, 25, 50].includes(Number(searchParams.get("pageSize")))
    ? Number(searchParams.get("pageSize"))
    : 10;
  const search = (searchParams.get("q") || "").trim().slice(0, 100);
  const language = searchParams.get("language") || "all";
  const published = searchParams.get("published") || "all";
  const conditions = [];
  if (languages.has(language)) conditions.push({ language });
  if (published === "published") conditions.push({ published: true });
  if (published === "draft") conditions.push({ published: { $ne: true } });
  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    conditions.push({ $or: [{ title: expression }, { category: expression }, { summary: expression }] });
  }

  const filter = conditions.length ? { $and: conditions } : {};
  const db = await getMongoDatabase();
  const collection = db.collection("learningContent");
  const [items, total, everything, publishedCount, draftCount] = await Promise.all([
    collection.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(filter),
    collection.countDocuments(),
    collection.countDocuments({ published: true }),
    collection.countDocuments({ published: { $ne: true } }),
  ]);

  return Response.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    summary: { total: everything, published: publishedCount, drafts: draftCount },
  });
}

export async function POST(request) {
  const access = await getAdminAccess();
  if (!access.session) {
    return Response.json({ error: "Admin access required." }, { status: access.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const content = validateContent(body);
  if (typeof content === "string") return Response.json({ error: content }, { status: 400 });

  const now = new Date();
  const item = {
    _id: randomUUID(),
    ...content,
    createdAt: now,
    updatedAt: now,
    updatedBy: access.session.user.id,
  };
  const db = await getMongoDatabase();
  await db.collection("learningContent").insertOne(item);

  return Response.json({ item }, { status: 201 });
}

export async function PATCH(request) {
  const access = await getAdminAccess();
  if (!access.session) {
    return Response.json({ error: "Admin access required." }, { status: access.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body?.id !== "string") {
    return Response.json({ error: "Content id is required." }, { status: 400 });
  }
  const content = validateContent(body);
  if (typeof content === "string") return Response.json({ error: content }, { status: 400 });

  const db = await getMongoDatabase();
  const result = await db.collection("learningContent").updateOne(
    { _id: body.id },
    { $set: { ...content, updatedAt: new Date(), updatedBy: access.session.user.id } },
  );

  if (!result.matchedCount) return Response.json({ error: "Content not found." }, { status: 404 });
  return Response.json({ success: true });
}

export async function DELETE(request) {
  const access = await getAdminAccess();
  if (!access.session) {
    return Response.json({ error: "Admin access required." }, { status: access.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body?.id !== "string") {
    return Response.json({ error: "Content id is required." }, { status: 400 });
  }

  const db = await getMongoDatabase();
  const result = await db.collection("learningContent").deleteOne({ _id: body.id });
  if (!result.deletedCount) return Response.json({ error: "Content not found." }, { status: 404 });
  return Response.json({ success: true });
}