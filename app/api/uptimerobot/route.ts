import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = "u3280550-3738730693a90f85b664dbd9";

  try {
    const response = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_key: apiKey,
        format: "json",
        logs: "1",
      }),
    });

    const data = await response.json();

    if (data.stat === "ok") {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: data.error?.message || "Failed to fetch monitors" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("UptimeRobot API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
