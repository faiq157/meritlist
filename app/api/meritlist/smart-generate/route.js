import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const body = await req.json();
    const { programId, programName, programShortName, meritList, checkPreferences = true } = body;
    
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
      `SELECT cnic, program_id, program_short_name, matched_preference 
       FROM merit_list 
       WHERE cnic IN (${placeholders})`,
      studentCNICs
    );

    // Create a map of existing students with their preferences
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

    // Step 2: Filter students based on preferences and existing entries
    const newStudents = [];
    const skippedStudents = [];
    const preferenceConflicts = [];
    const targetSeats = meritList.length; // Original requested seats

    for (const student of meritList) {
      const existingEntries = existingStudentMap.get(student.cnic);
      
      if (!existingEntries || existingEntries.length === 0) {
        // Student doesn't exist in any merit list - add them
        newStudents.push(student);
      } else if (checkPreferences) {
        // Check preference conflicts
        const currentPreference = Number(student.matchedPreference);
        const hasHigherPreference = existingEntries.every(entry => 
          currentPreference < Number(entry.preference)
        );
        
        if (hasHigherPreference) {
          // This program has higher preference - add student and remove from lower preferences
          newStudents.push(student);
          preferenceConflicts.push({
            cnic: student.cnic,
            name: student.name,
            currentPreference,
            existingEntries
          });
        } else {
          // Student has higher preference elsewhere - skip
          skippedStudents.push({
            ...student,
            reason: "Higher preference elsewhere",
            existingEntries
          });
        }
      } else {
        // Preference checking disabled - skip if exists anywhere
        skippedStudents.push({
          ...student,
          reason: "Already exists in merit list"
        });
      }
    }

    // Step 3: Remove students from lower preference lists
    let removedFromOtherLists = 0;
    for (const conflict of preferenceConflicts) {
      for (const entry of conflict.existingEntries) {
        if (conflict.currentPreference < Number(entry.preference)) {
          await connection.execute(
            `DELETE FROM merit_list WHERE cnic = ? AND program_id = ?`,
            [conflict.cnic, entry.programId]
          );
          removedFromOtherLists++;
        }
      }
    }

    // Step 4: Insert the new students
    const values = newStudents.map((student, index) => {
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
        message: "Smart merit list generated successfully", 
        version: newVersion,
        totalStudents: meritList.length,
        addedStudents: newStudents.length,
        skippedStudents: skippedStudents.length,
        preferenceConflicts: preferenceConflicts.length,
        removedFromOtherLists,
        targetSeats: targetSeats,
        seatsFilled: newStudents.length,
        details: {
          newStudents: newStudents.map(s => ({ name: s.name, cnic: s.cnic })),
          skippedStudents: skippedStudents.map(s => ({ 
            name: s.name, 
            cnic: s.cnic, 
            reason: s.reason 
          })),
          preferenceConflicts: preferenceConflicts.map(c => ({
            name: c.name,
            cnic: c.cnic,
            currentPreference: c.currentPreference,
            existingPrograms: c.existingEntries.map(e => e.programShortName)
          }))
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating smart merit list:", error);
    return new Response(
      JSON.stringify({ message: "Error generating smart merit list", error: error.message }),
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
    const showOnlyHighestPreference = url.searchParams.get("highestPreferenceOnly") === "true";

    if (!programId && !programShortName) {
      return new Response(
        JSON.stringify({ message: "Program ID or Program Short Name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let query = `
      SELECT * FROM merit_list
      WHERE 1=1
    `;
    const params = [];

    if (programId) {
      query += " AND program_id = ?";
      params.push(programId);
    }

    if (programShortName) {
      query += " AND program_short_name = ?";
      params.push(programShortName);
    }

    query += " ORDER BY version DESC, matched_preference ASC, `rank` ASC";

    const [rows] = await connection.execute(query, params);

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
        seen.add(row.cnic);
      }
    }

    return new Response(JSON.stringify({
      totalStudents: filtered.length,
      highPreferenceStudents: filtered.filter(s => [1,2,3,4].includes(Number(s.matched_preference))).length,
      students: filtered
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching smart merit list:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching smart merit list", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 