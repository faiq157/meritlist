import { getConnection } from "@/lib/mysql";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ message: "Program ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const connection = await getConnection();
    // Query the program data by ID
    const [rows] = await connection.execute(
      "SELECT * FROM programs WHERE id = ?",
      [id]
    );

    



    if (rows.length === 0) {
      console.warn(`No program found with ID: ${id}`);
      return new Response(
        JSON.stringify({ message: "Program not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching program data:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching program data", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}