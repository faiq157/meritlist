import { getConnection } from "@/lib/mysql";
import { 
  getAllMeritListEntriesForStudent, 
  getHighestPreferenceForStudent,
  filterHighPreferenceStudents 
} from "@/app/utils/preferenceMeritList";

// GET: Get comprehensive student status across all merit lists
export async function GET(req) {
  const connection = await getConnection();
  try {
    const url = new URL(req.url);
    const cnic = url.searchParams.get("cnic");
    const formNo = url.searchParams.get("form_no");

    if (!cnic && !formNo) {
      return new Response(
        JSON.stringify({ message: "CNIC or Form Number is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let query = "";
    const params = [];

    if (cnic && formNo) {
      query = `
        SELECT 
          ml.*,
          sa.selected_for_meritlist,
          sa.selected_program_shortname
        FROM merit_list ml
        LEFT JOIN student_applications sa ON sa.cnic = ml.cnic
        WHERE ml.cnic = ? OR ml.form_no = ?
        ORDER BY ml.matched_preference ASC, ml.\`rank\` ASC
      `;
      params.push(cnic, formNo);
    } else if (cnic) {
      query = `
        SELECT 
          ml.*,
          sa.selected_for_meritlist,
          sa.selected_program_shortname
        FROM merit_list ml
        LEFT JOIN student_applications sa ON sa.cnic = ml.cnic
        WHERE ml.cnic = ?
        ORDER BY ml.matched_preference ASC, ml.\`rank\` ASC
      `;
      params.push(cnic);
    } else if (formNo) {
      query = `
        SELECT 
          ml.*,
          sa.selected_for_meritlist,
          sa.selected_program_shortname
        FROM merit_list ml
        LEFT JOIN student_applications sa ON sa.cnic = ml.cnic
        WHERE ml.form_no = ?
        ORDER BY ml.matched_preference ASC, ml.\`rank\` ASC
      `;
      params.push(formNo);
    }

    const [rows] = await connection.execute(query, params);

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Student not found in any merit list",
          studentExists: false,
          meritListEntries: [],
          highestPreference: null,
          highPreferenceEntries: []
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get student info from first row
    const studentInfo = {
      cnic: rows[0].cnic,
      name: rows[0].name,
      form_no: rows[0].form_no,
      category: rows[0].category
    };

    // Filter high preference entries (1,2,3,4)
    const highPreferenceEntries = filterHighPreferenceStudents(rows);

    // Get highest preference entry
    const highestPreference = rows.length > 0 ? rows[0] : null;

    // Group entries by program
    const entriesByProgram = {};
    rows.forEach(entry => {
      const programKey = `${entry.program_id}_${entry.program_short_name}`;
      if (!entriesByProgram[programKey]) {
        entriesByProgram[programKey] = {
          programId: entry.program_id,
          programName: entry.program_name,
          programShortName: entry.program_short_name,
          entries: []
        };
      }
      entriesByProgram[programKey].entries.push(entry);
    });

    // Convert to array
    const programs = Object.values(entriesByProgram);

    const response = {
      studentExists: true,
      studentInfo,
      totalEntries: rows.length,
      highPreferenceEntries: highPreferenceEntries.length,
      highestPreference: highestPreference ? {
        programId: highestPreference.program_id,
        programShortName: highestPreference.program_short_name,
        preference: highestPreference.matched_preference,
        rank: highestPreference.rank,
        version: highestPreference.version
      } : null,
      allEntries: rows,
      highPreferenceOnly: highPreferenceEntries,
      programs
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching student status:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching student status", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST: Check if student should be added to a specific merit list
export async function POST(req) {
  const connection = await getConnection();
  try {
    const body = await req.json();
    const { cnic, programId, preference } = body;

    if (!cnic || !programId || preference === undefined) {
      return new Response(
        JSON.stringify({ message: "CNIC, Program ID, and Preference are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check existing entries for this student
    const [existingEntries] = await connection.execute(
      `SELECT program_id, program_short_name, matched_preference 
       FROM merit_list 
       WHERE cnic = ? AND program_id != ?`,
      [cnic, programId]
    );

    const shouldInclude = existingEntries.length === 0 || 
      existingEntries.every(entry => preference < Number(entry.matched_preference));

    const conflicts = existingEntries.filter(entry => 
      preference >= Number(entry.matched_preference)
    );

    const response = {
      shouldInclude,
      existingEntries,
      conflicts,
      willRemoveFromLowerPreferences: conflicts.length > 0,
      recommendation: shouldInclude ? 
        "Student can be added to this merit list" : 
        "Student should not be added (has higher preference elsewhere)"
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error checking student eligibility:", error);
    return new Response(
      JSON.stringify({ message: "Error checking student eligibility", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 