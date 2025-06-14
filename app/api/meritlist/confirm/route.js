import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();

  try {
    const body = await req.json();
    const { cnic, programId } = body;

    if (!cnic || !programId) {
      return new Response(
        JSON.stringify({ message: "CNIC and Program ID are required" }),
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

    // Set confirmed = 1
    await connection.execute(
      `UPDATE merit_list SET confirmed = 1 WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );

    // Check if both confirmed and lockseat are true
    const [rows] = await connection.execute(
      `SELECT program_short_name FROM merit_list WHERE cnic = ? AND program_id = ? AND confirmed = 1 AND lockseat = 1`,
      [cnic, programId]
    );
    if (rows.length > 0) {
      const programShortName = rows[0].program_short_name;
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