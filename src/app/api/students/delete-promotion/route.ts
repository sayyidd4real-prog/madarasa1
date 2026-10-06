import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

export async function DELETE(request: Request) {
  try {
    await initMysqlDb();
    const { searchParams } = new URL(request.url);
    const promotionId = searchParams.get("id");

    if (!promotionId) {
      return NextResponse.json({ success: false, error: "Promotion ID is required." }, { status: 400 });
    }

    const [pRows] = await queryDb("SELECT * FROM promotions WHERE id = ?", [promotionId]);
    if ((pRows as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Promotion record was not found." }, { status: 404 });
    }

    // Delete ONLY the selected promotion history record by its unique database ID
    await queryDb("DELETE FROM promotions WHERE id = ?", [promotionId]);

    return NextResponse.json({
      success: true,
      message: "Promotion history record deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete Promotion History Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete promotion history record." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const promotionId = body.promotionId || body.id;

    if (!promotionId) {
      return NextResponse.json({ success: false, error: "Promotion ID is required." }, { status: 400 });
    }

    const [pRows] = await queryDb("SELECT * FROM promotions WHERE id = ?", [promotionId]);
    if ((pRows as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Promotion record was not found." }, { status: 404 });
    }

    // Delete ONLY the selected promotion history record by its unique database ID
    await queryDb("DELETE FROM promotions WHERE id = ?", [promotionId]);

    return NextResponse.json({
      success: true,
      message: "Promotion history record deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete Promotion History Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete promotion history record." },
      { status: 500 }
    );
  }
}
