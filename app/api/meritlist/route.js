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

    // Get the current merit list version for the program
    const [rows] = await connection.execute(
      "SELECT MAX(version) AS maxVersion FROM merit_list WHERE program_id = ?",
      [programId]
    );
    const currentVersion = rows[0]?.maxVersion || 0;
    const newVersion = currentVersion + 1;

    // Step 1: Check which students already exist in any merit list
    const studentCNICs = meritList.map(student => student.cnic);
    const placeholders = studentCNICs.map(() => "?").join(",");
    
    const [existingStudents] = await connection.execute(
      `SELECT cnic FROM merit_list WHERE cnic IN (${placeholders})`,
      studentCNICs
    );

    // Step 1b: Check which students have been cancelled
    const [cancelledStudents] = await connection.execute(
      `SELECT cnic FROM cancelled_meritlist WHERE cnic IN (${placeholders})`,
      studentCNICs
    );
    const cancelledCNICs = new Set(cancelledStudents.map(student => student.cnic));

    // Create a set of existing CNICs for fast lookup
    const existingCNICs = new Set(existingStudents.map(student => student.cnic));

    // Step 2: Filter out students who already exist in any merit list or have been cancelled
    const newStudents = meritList.filter(student => !existingCNICs.has(student.cnic) && !cancelledCNICs.has(student.cnic));
    const skippedStudents = meritList.filter(student => existingCNICs.has(student.cnic) || cancelledCNICs.has(student.cnic));

    console.log(`Total students: ${meritList.length}`);
    console.log(`New students to add: ${newStudents.length}`);
    console.log(`Skipped students (already exist or cancelled): ${skippedStudents.length}`);

    // Step 3: Insert only the new students
    const values = newStudents.map((student, index) => {
      console.log("Adding new student:", student.name, student.cnic);
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
        message: "Merit list stored successfully", 
        version: newVersion,
        totalStudents: meritList.length,
        addedStudents: newStudents.length,
        skippedStudents: skippedStudents.length,
        targetSeats: meritList.length,
        seatsFilled: newStudents.length,
        skippedCNICs: Array.from(existingCNICs)
      }),
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
    const formNo = url.searchParams.get("form_no"); 
    const showOnlyHighestPreference = url.searchParams.get("highestPreferenceOnly") === "true";

    

    if (!programId && !programShortName && !cnic) {
      return new Response(
        JSON.stringify({ message: "Program ID, Program Short Name, or CNIC is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let query = "";
    const params = [];

 if (cnic || formNo) {
  // Fetch all entries by CNIC
  query = `
      SELECT 
        ml.*,
        sa.selected_for_meritlist,
        sa.selected_program_shortname
      FROM merit_list ml
      LEFT JOIN student_applications sa ON sa.cnic = ml.cnic
      WHERE
        ${cnic && formNo ? "(ml.cnic = ? OR ml.form_no = ?)" : cnic ? "ml.cnic = ?" : "ml.form_no = ?"}
      ORDER BY ml.version ASC
    `;
  if (cnic && formNo) {
    params.push(cnic, formNo);
  } else if (cnic) {
    params.push(cnic);
  } else if (formNo) {
    params.push(formNo);
  }

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

      query += " ORDER BY version ASC";
    }

    const [rows] = await connection.execute(query, params);

    // If querying by CNIC, return raw results
    if (cnic) {
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Filter logic: skip CNICs already seen in earlier versions
    const seen = new Set();
    const filtered = [];

    for (const row of rows) {
      if (!seen.has(row.cnic)) {
        // If highestPreferenceOnly is true, only include students with preference 1,2,3,4
        if (showOnlyHighestPreference) {
          if ([1, 2, 3, 4].includes(Number(row.matched_preference))) {
            filtered.push(row);
          }
        } else {
          filtered.push(row);
        }
        seen.add(row.cnic); // mark CNIC as already included
      }
    }

    return new Response(JSON.stringify(filtered), {
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
      JSON.stringify({ message: 'Merit list and confirmed seats deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting merit list:', error);
    return new Response(
      JSON.stringify({ message: 'Error deleting merit list', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

  
