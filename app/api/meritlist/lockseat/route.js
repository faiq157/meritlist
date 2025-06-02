import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const body = await req.json();
    const { cnic, programId, lock,  } = body;

    if (!cnic || !programId || typeof lock !== "boolean" ) {
      return new Response(
        JSON.stringify({ message: "CNIC, Program ID, lock (boolean), and Program Short Name are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update lockseat
    await connection.execute(
      `UPDATE merit_list 
       SET lockseat = ? 
       WHERE cnic = ? AND program_id = ?`,
      [lock, cnic, programId]
    );

    // If locking, check if confirmed is also true, then insert into confirmed_seats
    if (lock) {
      const [rows] = await connection.execute(
        `SELECT * FROM merit_list WHERE cnic = ? AND program_id = ? AND lockseat = 1 AND confirmed = 1`,
        [cnic, programId]
      );
      if (rows.length > 0) {
        // Check if already in confirmed_seats to avoid duplicates
        const [exists] = await connection.execute(
          `SELECT * FROM confirmed_seats WHERE cnic = ? AND program_id = ?`,
          [cnic, programId]
        );
        if (exists.length === 0) {
          await connection.execute(
            `INSERT INTO confirmed_seats (cnic, program_id, program_short_name) VALUES (?, ?, ?)`,
            [cnic, programId, programShortName]
          );
        }
      }
    }

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