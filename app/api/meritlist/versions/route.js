import { getConnection } from "@/lib/mysql";

export async function GET(req) {
  const connection = await getConnection();
  try {
    const url = new URL(req.url);
    const programId = url.searchParams.get("programId");

    if (!programId) {
      return new Response(
        JSON.stringify({ message: "Program ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [rows] = await connection.execute(
      "SELECT DISTINCT version FROM merit_list WHERE program_id = ? ORDER BY version DESC",
      [programId]
    );

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching versions", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}



export async function DELETE(req) {
  const connection = await getConnection();
  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");
    const version = searchParams.get("version");

    if (!programId || !version) {
      return new Response(
        JSON.stringify({ message: "programId and version are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Get all CNICs from merit_list for this program and version
    const [students] = await connection.execute(
      `SELECT cnic FROM merit_list WHERE program_id = ? AND version = ?`,
      [programId, version]
    );

    if (students.length === 0) {
      return new Response(
        JSON.stringify({ message: "No merit list found for given program and version" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract CNICs
    const cnics = students.map((student) => student.cnic);

    // 2. Delete merit_list entries for this program and version
    await connection.execute(
      `DELETE FROM merit_list WHERE program_id = ? AND version = ?`,
      [programId, version]
    );

    // 3. Update student_applications set selected_for_meritlist = 0 for those CNICs
    if (cnics.length > 0) {
      // Build placeholders for the IN clause (?, ?, ?...)
      const placeholders = cnics.map(() => "?").join(",");
      const params = [...cnics];

      const updateQuery = `
        UPDATE student_applications
        SET selected_for_meritlist = 0
        WHERE cnic IN (${placeholders}) AND program_id = ?
      `;

      // Add programId param at the end
      params.push(programId);

      await connection.execute(updateQuery, params);
    }

    return new Response(
      JSON.stringify({ message: "Merit list version deleted and student flags updated" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting merit list version:", error);
    return new Response(
      JSON.stringify({ message: "Error deleting merit list version", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


