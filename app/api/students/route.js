import { getConnection } from "@/lib/mysql";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // you are passing ?id=123 in your fetch call

  if (!id) {
    return new Response(
      JSON.stringify({ message: "Program ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const connection = await getConnection();

    // 1. Get program short_name by id
    const [programRows] = await connection.execute(
      `SELECT short_name FROM programs WHERE id = ? LIMIT 1`,
      [id]
    );

    if (programRows.length === 0) {
      return new Response(
        JSON.stringify({ message: "Program not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const short_name = programRows[0].short_name;

    // 2. Find student applications where any preference matches the program short_name
    const [rows] = await connection.execute(
      `
      SELECT * FROM student_applications 
      WHERE 
        preference_1 = ? OR 
        preference_2 = ? OR 
        preference_3 = ? OR 
        preference_4 = ? OR 
        preference_5 = ? OR 
        preference_6 = ? OR 
        preference_7 = ? OR 
        preference_8 = ? OR 
        preference_9 = ? OR 
        preference_10 = ?
      `,
      [short_name, short_name, short_name, short_name, short_name, short_name, short_name, short_name, short_name, short_name]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No student applications found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching student applications:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching student applications", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
