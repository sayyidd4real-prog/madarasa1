import { NextResponse } from "next/server";
import { queryDb, initMysqlDb } from "@/lib/db";

async function calculateStudentBalance(studentId: string): Promise<number> {
  const [rows] = await queryDb(
    "SELECT SUM(amount) as totalCharges, SUM(paid) as totalPayments, SUM(deductions) as totalDeductions FROM fees WHERE student_id = ?",
    [studentId]
  );
  const r = (rows as any[])[0] || {};
  const charges = parseFloat(r.totalCharges || 0);
  const payments = parseFloat(r.totalPayments || 0);
  const deductions = parseFloat(r.totalDeductions || 0);
  return Math.max(0, charges - payments - deductions);
}

export async function POST(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const {
      action,
      studentId,
      studentIds,
      description,
      amount,
      searchQuery
    } = body;

    // 1. SEARCH STUDENTS API
    if (action === "search_students") {
      if (!searchQuery || !searchQuery.trim()) {
        return NextResponse.json({ success: true, results: [] });
      }
      const q = `%${searchQuery.trim().toLowerCase()}%`;
      const [matched] = await queryDb(
        "SELECT id, name, email, COALESCE(phoneNumber, '') AS phoneNumber, grade AS className, '2025–2026' AS academicYear FROM students WHERE LOWER(id) LIKE ? OR LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(COALESCE(phoneNumber, '')) LIKE ? LIMIT 8",
        [q, q, q, q]
      );

      const results = [];
      for (const s of (matched as any[])) {
        const outstandingBalance = await calculateStudentBalance(s.id);
        results.push({ ...s, outstandingBalance });
      }

      return NextResponse.json({ success: true, results });
    }

    // 2. CREATE CHARGE API
    if (action === "charge") {
      const ids = Array.isArray(studentIds) ? studentIds : [studentId].filter(Boolean);
      if (!ids || ids.length === 0) {
        return NextResponse.json({ success: false, error: "At least one student must be selected." }, { status: 400 });
      }
      if (!description || !description.trim()) {
        return NextResponse.json({ success: false, error: "Charge description is required." }, { status: 400 });
      }
      const chargeAmt = parseFloat(amount);
      if (isNaN(chargeAmt) || chargeAmt <= 0) {
        return NextResponse.json({ success: false, error: "Charge amount must be greater than zero." }, { status: 400 });
      }

      const createdTransactions: any[] = [];
      const timestamp = Date.now();

      for (let i = 0; i < ids.length; i++) {
        const sid = ids[i];
        const [sRows] = await queryDb("SELECT name, grade FROM students WHERE id = ?", [sid]);
        if ((sRows as any[]).length === 0) {
          return NextResponse.json({ success: false, error: `Student ID "${sid}" is invalid.` }, { status: 400 });
        }
        const student = (sRows as any[])[0];

        const feeId = `fee-${timestamp}-${i}-${Math.floor(Math.random() * 1000)}`;
        await queryDb(
          "INSERT INTO fees (id, student_id, name, amount, paid, deductions, status) VALUES (?, ?, ?, ?, 0, 0, 'unpaid')",
          [feeId, sid, description.trim(), chargeAmt]
        );

        createdTransactions.push({
          id: feeId,
          studentId: sid,
          studentName: student.name,
          className: student.grade || "Unassigned",
          feeName: description.trim(),
          amount: chargeAmt,
          paid: 0,
          deductions: 0,
          status: "unpaid",
          transactionType: "Charge"
        });
      }

      return NextResponse.json({
        success: true,
        message: `Charge created successfully for ${ids.length} student(s).`,
        transactions: createdTransactions
      });
    }

    // 3. RECORD PAYMENT API
    if (action === "payment") {
      if (!studentId || !studentId.trim()) {
        return NextResponse.json({ success: false, error: "Student must be selected." }, { status: 400 });
      }
      const payAmt = parseFloat(amount);
      if (isNaN(payAmt) || payAmt <= 0) {
        return NextResponse.json({ success: false, error: "Payment amount must be greater than zero." }, { status: 400 });
      }

      const [sRows] = await queryDb("SELECT name, grade FROM students WHERE id = ?", [studentId]);
      if ((sRows as any[]).length === 0) {
        return NextResponse.json({ success: false, error: "Selected student does not exist." }, { status: 404 });
      }
      const student = (sRows as any[])[0];

      const feeId = `fee-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await queryDb(
        "INSERT INTO fees (id, student_id, name, amount, paid, deductions, status) VALUES (?, ?, 'Payment received', 0, ?, 0, 'Paid')",
        [feeId, studentId, payAmt]
      );

      return NextResponse.json({
        success: true,
        message: "Payment recorded successfully.",
        transaction: {
          id: feeId,
          studentId,
          studentName: student.name,
          className: student.grade || "Unassigned",
          feeName: "Payment received",
          amount: 0,
          paid: payAmt,
          deductions: 0,
          status: "Paid",
          transactionType: "Payment"
        }
      });
    }

    // 4. APPLY WAIVER / CREDIT API
    if (action === "waiver" || action === "credit" || action === "deduction") {
      if (!studentId || !studentId.trim()) {
        return NextResponse.json({ success: false, error: "Student must be selected." }, { status: 400 });
      }
      const waiverAmt = parseFloat(amount);
      if (isNaN(waiverAmt) || waiverAmt <= 0) {
        return NextResponse.json({ success: false, error: "Waiver/credit amount must be greater than zero." }, { status: 400 });
      }

      const [sRows] = await queryDb("SELECT name, grade FROM students WHERE id = ?", [studentId]);
      if ((sRows as any[]).length === 0) {
        return NextResponse.json({ success: false, error: "Selected student does not exist." }, { status: 404 });
      }
      const student = (sRows as any[])[0];

      const feeId = `fee-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const descName = (description && description.trim()) || "Fee Waiver / Credit";
      await queryDb(
        "INSERT INTO fees (id, student_id, name, amount, paid, deductions, status) VALUES (?, ?, ?, 0, 0, ?, 'Waiver')",
        [feeId, studentId, descName, waiverAmt]
      );

      return NextResponse.json({
        success: true,
        message: "Waiver/credit applied successfully.",
        transaction: {
          id: feeId,
          studentId,
          studentName: student.name,
          className: student.grade || "Unassigned",
          feeName: descName,
          amount: 0,
          paid: 0,
          deductions: waiverAmt,
          status: "Waiver",
          transactionType: "Waiver"
        }
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Finance POST API Error:", error.stack || error.message || error);
    return NextResponse.json({ success: false, error: error.message || "Server error processing transaction." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initMysqlDb();
    const body = await request.json();
    const { id, feeName, amount } = body;
    if (!id || !feeName) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) {
      return NextResponse.json({ success: false, error: "Amount must be a non-negative number." }, { status: 400 });
    }

    const [fRows] = await queryDb("SELECT amount, paid, deductions FROM fees WHERE id = ?", [id]);
    if ((fRows as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Record not found." }, { status: 404 });
    }
    const existing = (fRows as any[])[0];

    if (existing.paid > 0 && existing.amount === 0) {
      await queryDb("UPDATE fees SET name = ?, paid = ? WHERE id = ?", [feeName.trim(), val, id]);
    } else if (existing.deductions > 0 && existing.amount === 0) {
      await queryDb("UPDATE fees SET name = ?, deductions = ? WHERE id = ?", [feeName.trim(), val, id]);
    } else {
      await queryDb("UPDATE fees SET name = ?, amount = ? WHERE id = ?", [feeName.trim(), val, id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Finance PUT API Error:", error.stack || error.message || error);
    return NextResponse.json({ success: false, error: error.message || "Server error updating transaction." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initMysqlDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    }

    await queryDb("DELETE FROM fees WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Finance DELETE API Error:", error.stack || error.message || error);
    return NextResponse.json({ success: false, error: error.message || "Server error deleting transaction." }, { status: 500 });
  }
}

