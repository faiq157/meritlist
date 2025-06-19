import { getConnection } from "@/lib/mysql";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

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

    // 2. Get all columns that start with 'preference_'
    const [columnsRows] = await connection.execute(
      `SHOW COLUMNS FROM student_applications LIKE 'preference_%'`
    );
    const preferenceColumns = columnsRows.map(col => col.Field);

    if (preferenceColumns.length === 0) {
      return new Response(
        JSON.stringify({ message: "No preference columns found" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Build dynamic WHERE clause
    const whereClause = preferenceColumns.map(col => `${col} = ?`).join(" OR ");
    const params = Array(preferenceColumns.length).fill(short_name);

    const [rows] = await connection.execute(
      `SELECT * FROM student_applications WHERE ${whereClause}`,
      params
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No student applications found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. For each student, find which preference matched
console.log("Short name to match:", short_name);
console.log("Preference columns:", preferenceColumns);
console.log("Fetched students:", rows.length);

const result = rows.map(student => {
  let matchedPreference = null;
  for (let i = 0; i < preferenceColumns.length; i++) {
    const col = preferenceColumns[i];
    if (student[col] === short_name) {
      const match = col.match(/_(\d+)$/);
      matchedPreference = match ? Number(match[1]) : i + 1;
      console.log(
        `Student ${student.name} (${student.cnic}) matched at ${col} (number: ${matchedPreference})`
      );
      break;
    }
  }
  if (matchedPreference === null) {
    console.log(`Student ${student.name} (${student.cnic}) did not match any preference`);
  }
  return {
    ...student,
    matchedPreference,
  };
});
    return new Response(JSON.stringify(result), {
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