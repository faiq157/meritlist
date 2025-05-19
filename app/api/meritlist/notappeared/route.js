import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const body = await req.json();
    const { cnic, programId, programShortName } = body;

    if (!cnic || !programId || !programShortName) {
      return new Response(
        JSON.stringify({ message: "CNIC, Program ID, and Program Short Name are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Mark the student as "Not Appeared" by setting confirmed to 0
    await connection.execute(
      `UPDATE merit_list 
       SET not_appeared = 1 
       WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );

    return new Response(
      JSON.stringify({ message: "Student marked as 'Not Appeared'" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error marking student as 'Not Appeared':", error);
    return new Response(
      JSON.stringify({ message: "Error marking student as 'Not Appeared'", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}