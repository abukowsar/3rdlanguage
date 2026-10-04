import { ObjectId } from "mongodb";
import { getAdminAccess } from "@/lib/admin";
import { getMongoDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

function parsePage(value) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  const status = searchParams.get("status") || "all";
  const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const conditions = [{ email: { $ne: adminEmail } }];

  if (["pending", "approved", "rejected"].includes(status)) {
    conditions.push(status === "pending"
      ? { $or: [{ applicantStatus: "pending" }, { applicantStatus: { $exists: false } }] }
      : { applicantStatus: status });
  }
  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    conditions.push({ $or: [{ name: expression }, { email: expression }] });
  }

  const filter = { $and: conditions };
  const db = await getMongoDatabase();
  const users = db.collection("user");
  const [applicants, total, everyone, pending, approved, rejected] = await Promise.all([
    users.find(filter, {
      projection: { name: 1, email: 1, applicantStatus: 1, createdAt: 1 },
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray(),
    users.countDocuments(filter),
    users.countDocuments({ email: { $ne: adminEmail } }),
    users.countDocuments({ email: { $ne: adminEmail }, $or: [{ applicantStatus: "pending" }, { applicantStatus: { $exists: false } }] }),
    users.countDocuments({ email: { $ne: adminEmail }, applicantStatus: "approved" }),
    users.countDocuments({ email: { $ne: adminEmail }, applicantStatus: "rejected" }),
  ]);

  return Response.json({
    applicants,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    summary: { total: everyone, pending, approved, rejected },
  });
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

  const allowedStatuses = new Set(["pending", "approved", "rejected"]);
  if (typeof body?.userId !== "string" || !ObjectId.isValid(body.userId) || !allowedStatuses.has(body.status)) {
    return Response.json({ error: "Invalid applicant status." }, { status: 400 });
  }

  const db = await getMongoDatabase();
  const result = await db.collection("user").updateOne(
    // Better Auth stores user ids as ObjectId, so the string id from the client must be converted.
    { _id: new ObjectId(body.userId), email: { $ne: process.env.ADMIN_EMAIL.trim().toLowerCase() } },
    { $set: { applicantStatus: body.status, reviewedAt: new Date(), reviewedBy: access.session.user.id } },
  );

  if (!result.matchedCount) {
    return Response.json({ error: "Applicant not found." }, { status: 404 });
  }

  return Response.json({ success: true });
}