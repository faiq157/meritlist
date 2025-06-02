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

    // Only set confirmed = 1
    await connection.execute(
      `UPDATE merit_list 
       SET confirmed = 1
       WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );

    // Check if lockseat is true after confirming
    const [rows] = await connection.execute(
      `SELECT lockseat FROM merit_list WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );
    if (rows.length > 0 && rows[0].lockseat === 1) {
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

    return new Response(
      JSON.stringify({ message: "Seat confirmed." }),
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