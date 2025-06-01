import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();

  try {
    const body = await req.json();
    const { cnic, programId, programShortName } = body;

    // Validate required data
    if (!cnic || !programId || !programShortName) {
      return new Response(
        JSON.stringify({ message: "CNIC, Program ID, and Program Short Name are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user is already confirmed in any department
    const [alreadyConfirmed] = await connection.execute(
      `SELECT * FROM confirmed_seats WHERE cnic = ?`,
      [cnic]
    );
    if (alreadyConfirmed.length > 0) {
      return new Response(
        JSON.stringify({ message: "User already confirmed in another department.", alreadyConfirmed: true }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 1: Confirm the seat in the selected program (set admitted = 1 as well)
    await connection.execute(
      `UPDATE merit_list 
       SET confirmed = 1, lockseat = 1
       WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );

    // Step 2: Insert into confirmed_seats if lockseat and admitted are true
    const [rows] = await connection.execute(
      `SELECT * FROM merit_list WHERE cnic = ? AND program_id = ? AND lockseat = 1 AND confirmed = 1`,
      [cnic, programId]
    );
    if (rows.length > 0) {
      await connection.execute(
        `INSERT INTO confirmed_seats (cnic, program_id, program_short_name) VALUES (?, ?, ?)`,
        [cnic, programId, programShortName]
      );
    }

    // Step 3: Remove the same student from all other programs
    await connection.execute(
      `DELETE FROM merit_list 
       WHERE cnic = ? AND program_id != ? AND confirmed = 1 AND lockseat = 1`,
      [cnic, programId]
    );

    // Step 4: Remove the student from all other merit lists
    await connection.execute(
      `DELETE FROM merit_list 
       WHERE cnic = ? AND program_id != ?`,
      [cnic, programId]
    );

    return new Response(
      JSON.stringify({ message: "Seat confirmed and added to confirmed_seats." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error confirming seat:", error);
    return new Response(
      JSON.stringify({ message: "Error confirming seat", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}