export const dynamic = 'force-dynamic'

import { getAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authorization.split("Bearer ")[1];
  const decoded = await getAdminAuth().verifyIdToken(idToken, true);

  await prisma.user.upsert({
    where: { id: decoded.uid },
    update: {
      email: decoded.email ?? "",
      name: decoded.name ?? null,
    },
    create: {
      id: decoded.uid,
      email: decoded.email ?? "",
      name: decoded.name ?? null,
    },
  });

  const response = NextResponse.json({ status: "success" });

  response.cookies.set("session", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
