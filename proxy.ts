import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Basic ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="Admin Area"`,
      },
    });
  }

  const base64 = auth.split(" ")[1];
  const [username, password] = atob(base64).split(":");

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="Admin Area"`,
      },
    });
  }

  return NextResponse.next();
}
