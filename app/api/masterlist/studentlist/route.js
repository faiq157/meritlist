import { getConnection } from "@/lib/mysql";

export async function GET(req) {
  try {
    const connection = await getConnection();

    // Fetch all rows and all columns from student_applications
    const [rows] = await connection.execute(
      `SELECT * FROM student_applications`
    );

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