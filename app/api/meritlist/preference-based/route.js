import { getConnection } from "@/lib/mysql";

// POST: Create preference-based merit list with duplicate checking
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

    // Get the current merit list version for the program
    const [rows] = await connection.execute(
      "SELECT MAX(version) AS maxVersion FROM merit_list WHERE program_id = ?",
      [programId]
    );
    const currentVersion = rows[0]?.maxVersion || 0;
    const newVersion = currentVersion + 1;

    // Step 1: Check which students already exist in other merit lists
    const studentCNICs = meritList.map(student => student.cnic);
    const placeholders = studentCNICs.map(() => "?").join(",");
    
    const [existingStudents] = await connection.execute(
      `SELECT cnic, program_id, program_short_name, matched_preference 
       FROM merit_list 
       WHERE cnic IN (${placeholders}) AND program_id != ?`,
      [...studentCNICs, programId]
    );

    // Create a map of existing students with their current preferences
    const existingStudentMap = new Map();
    existingStudents.forEach(student => {
      if (!existingStudentMap.has(student.cnic)) {
        existingStudentMap.set(student.cnic, []);
      }
      existingStudentMap.get(student.cnic).push({
        programId: student.program_id,
        programShortName: student.program_short_name,
        preference: student.matched_preference
      });
    });

    // Step 2: Filter students to only include those who should be in this merit list
    const filteredMeritList = meritList.filter(student => {
      const existingEntries = existingStudentMap.get(student.cnic);
      
      // If student doesn't exist in other merit lists, include them
      if (!existingEntries || existingEntries.length === 0) {
        return true;
      }
      
      // Check if this program has a higher preference (lower number) than existing entries
      const currentPreference = Number(student.matchedPreference);
      const hasHigherPreference = existingEntries.every(entry => 
        currentPreference < Number(entry.preference)
      );
      
      return hasHigherPreference;
    });

    // Step 3: Remove students from lower preference merit lists
    const studentsToRemove = meritList.filter(student => {
      const existingEntries = existingStudentMap.get(student.cnic);
      if (!existingEntries) return false;
      
      const currentPreference = Number(student.matchedPreference);
      return existingEntries.some(entry => currentPreference < Number(entry.preference));
    });

    // Remove students from lower preference lists
    for (const student of studentsToRemove) {
      const existingEntries = existingStudentMap.get(student.cnic);
      const currentPreference = Number(student.matchedPreference);
      
      for (const entry of existingEntries) {
        if (currentPreference < Number(entry.preference)) {
          await connection.execute(
            `DELETE FROM merit_list WHERE cnic = ? AND program_id = ?`,
            [student.cnic, entry.programId]
          );
        }
      }
    }

    // Step 4: Insert the filtered merit list
    const values = filteredMeritList.map((student, index) => {
      return [
        programId,
        programName,
        programShortName,
        student.name,
        student.cnic,
        student.merit,
        index + 1, // rank
        student.form_no,
        student.category,
        newVersion,
        0,
        student.matchedPreference
      ];
    });
    
    if (values.length > 0) {
      await connection.query(
        `INSERT INTO merit_list (
          program_id,
          program_name,
          program_short_name,
          name,
          cnic,
          merit,
          \`rank\`,       
          form_no,
          category,
          version,
          availed,
          matched_preference
        ) VALUES ?`,
        [values]
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Preference-based merit list stored successfully", 
        version: newVersion,
        totalStudents: meritList.length,
        filteredStudents: filteredMeritList.length,
        removedFromOtherLists: studentsToRemove.length
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error storing preference-based merit list:", error);
    return new Response(
      JSON.stringify({ message: "Error storing preference-based merit list", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// GET: Get preference-based merit list with highest preference filtering
export async function GET(req) {
  const connection = await getConnection();
  try {
    const url = new URL(req.url);
    const programId = url.searchParams.get("programId");
    const programShortName = url.searchParams.get("programShortName");
    const cnic = url.searchParams.get("cnic");
    const showOnlyHighestPreference = url.searchParams.get("highestPreferenceOnly") === "true";

    if (!programId && !programShortName && !cnic) {
      return new Response(
        JSON.stringify({ message: "Program ID, Program Short Name, or CNIC is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let query = "";
    const params = [];

    if (cnic) {
      // Fetch all entries by CNIC
      query = `
        SELECT 
          ml.*,
          sa.selected_for_meritlist,
          sa.selected_program_shortname
        FROM merit_list ml
        LEFT JOIN student_applications sa ON sa.cnic = ml.cnic
        WHERE ml.cnic = ?
        ORDER BY ml.matched_preference ASC, ml.version ASC
      `;
      params.push(cnic);
    } else {
      // Fetch by programId or programShortName
      query = `
        SELECT * FROM merit_list
        WHERE 1=1
      `;

      if (programId) {
        query += " AND program_id = ?";
        params.push(programId);
      }

      if (programShortName) {
        query += " AND program_short_name = ?";
        params.push(programShortName);
      }

      query += " ORDER BY version ASC, matched_preference ASC";
    }

    const [rows] = await connection.execute(query, params);

    // If querying by CNIC, return raw results
    if (cnic) {
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Filter logic for highest preference only
    if (showOnlyHighestPreference) {
      const seen = new Set();
      const filtered = [];

      for (const row of rows) {
        if (!seen.has(row.cnic)) {
          // Only include if matched_preference is 1, 2, 3, or 4
          if ([1, 2, 3, 4].includes(Number(row.matched_preference))) {
            filtered.push(row);
          }
          seen.add(row.cnic);
        }
      }

      return new Response(JSON.stringify(filtered), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Regular filtering: skip CNICs already seen in earlier versions
    const seen = new Set();
    const filtered = [];

    for (const row of rows) {
      if (!seen.has(row.cnic)) {
        filtered.push(row);
        seen.add(row.cnic);
      }
    }

    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching preference-based merit lists:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching preference-based merit lists", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE: Delete preference-based merit list
export async function DELETE(req) {
  const connection = await getConnection();
  try {
    const url = new URL(req.url);
    const programId = url.searchParams.get('programId');
    const version = url.searchParams.get('version');

    if (!programId || !version) {
      return new Response(
        JSON.stringify({ message: 'Program ID and version are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the merit list for the specified program and version
    await connection.execute(
      'DELETE FROM merit_list WHERE program_id = ? AND version = ?',
      [programId, version]
    );

    return new Response(
      JSON.stringify({ message: 'Preference-based merit list deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting preference-based merit list:', error);
    return new Response(
      JSON.stringify({ message: 'Error deleting preference-based merit list', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 