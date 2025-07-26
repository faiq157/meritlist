import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const { cnic, program_id, program_name, program_short_name } = await req.json();
    if (!cnic || !program_id || !program_name || !program_short_name) {
      return new Response(
        JSON.stringify({ message: "CNIC, program_id, program_name, and program_short_name are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the student exists in any merit list
    const [studentRows] = await connection.execute(
      `SELECT * FROM merit_list WHERE cnic = ? LIMIT 1`,
      [cnic]
    );
    if (studentRows.length === 0) {
      return new Response(
        JSON.stringify({ message: "Student not found in any merit list." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update program_id, program_name, and program_short_name
    await connection.execute(
      `UPDATE merit_list SET program_id = ?, program_name = ?, program_short_name = ? WHERE cnic = ?`,
      [program_id, program_name, program_short_name, cnic]
    );

    return new Response(
      JSON.stringify({ message: "Student shifted successfully.", program_id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}