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

    // Step 1: Confirm the seat in the selected program
    await connection.execute(
      `UPDATE merit_list 
       SET confirmed = 1 
       WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );

    // Step 2: Remove the same student from all other programs
    await connection.execute(
      `DELETE FROM merit_list 
       WHERE cnic = ? AND program_id != ?`,
      [cnic, programId]
    );

    return new Response(
      JSON.stringify({ message: "Seat confirmed for selected program and removed from others." }),
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
