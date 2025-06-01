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

    // Get all merit lists for this program, grouped by version
    const [rows] = await connection.execute(
      `SELECT * FROM merit_list WHERE program_id = ? ORDER BY version ASC, rank ASC`,
      [programId]
    );

    // Group by version
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.version]) grouped[row.version] = [];
      grouped[row.version].push(row);
    }

    // Convert to array of { version, meritList }
    const result = Object.entries(grouped).map(([version, meritList]) => ({
      version,
      meritList,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching all merit lists", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}