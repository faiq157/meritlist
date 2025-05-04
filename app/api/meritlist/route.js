import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const body = await req.json();
    const { programId, programName, programShortName, meritList } = body;

    if (!programId || !Array.isArray(meritList)) {
      return new Response(
        JSON.stringify({ message: "Invalid data provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Storing merit list for program ID:", programId);

    // Clear existing merit list for the program
    await connection.execute("DELETE FROM merit_list WHERE program_id = ?", [programId]);

    // Insert new merit list
    const values = meritList.map((student, index) => [
      programId,
      programName,
      programShortName,
      student.name, // Student name
      student.cnic, // Student CNIC
      student.merit, // Merit (aggregate)
      index + 1, // Rank
      student.category, // Category (e.g., open_merit or financial)
    ]);

    await connection.query(
      "INSERT INTO merit_list (program_id, program_name, program_short_name, name, cnic, merit, rank, category) VALUES ?",
      [values]
    );

    return new Response(
      JSON.stringify({ message: "Merit list and program details stored successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error storing merit list:", error);
    return new Response(
      JSON.stringify({ message: "Error storing merit list", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(req) {
  const connection = await getConnection();
  try {
    const url = new URL(req.url);
    const programId = url.searchParams.get("programId");
    const programShortName = url.searchParams.get("programShortName");
    const cnic = url.searchParams.get("cnic");

    // Ensure at least one parameter is provided
    if (!programId && !programShortName && !cnic) {
      return new Response(
        JSON.stringify({ message: "Program ID, Program Short Name, or CNIC is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let query = "";
    const params = [];

    // Fetch merit lists by CNIC
    if (cnic) {
      query = `
        SELECT 
          program_name, 
          program_short_name, 
          rank, 
          merit,
         name, 
          category 
        FROM merit_list 
        WHERE cnic = ?
      `;
      params.push(cnic);
    } else {
      // Fetch merit lists by programId or programShortName
      query = "SELECT * FROM merit_list WHERE 1=1";

      if (programId) {
        query += " AND program_id = ?";
        params.push(programId);
      }

      if (programShortName) {
        query += " AND program_short_name = ?";
        params.push(programShortName);
      }
    }

    const [rows] = await connection.execute(query, params);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching merit lists:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching merit lists", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

  