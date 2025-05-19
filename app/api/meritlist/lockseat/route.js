// File: /app/api/meritlist/lockseat/route.js
import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const body = await req.json();
    const { cnic, programId, lock } = body;

    if (!cnic || !programId || typeof lock !== "boolean") {
      return new Response(
        JSON.stringify({ message: "CNIC, Program ID, and lock (boolean) are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await connection.execute(
      `UPDATE merit_list 
       SET lockseat = ? 
       WHERE cnic = ? AND program_id = ?`,
      [lock, cnic, programId]
    );

    return new Response(
      JSON.stringify({ message: `Seat ${lock ? "locked" : "unlocked"}` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating lock status:", error);
    return new Response(
      JSON.stringify({ message: "Error updating lock status", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
