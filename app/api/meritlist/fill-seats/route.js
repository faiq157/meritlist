import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const body = await req.json();
    const { programId, programName, programShortName, meritList, targetSeats, checkPreferences = true } = body;
    
    if (!programId || !Array.isArray(meritList) || !targetSeats) {
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

    // Step 2: Process students to fill the requested seats
    const newStudents = [];
    const skippedStudents = [];
    const preferenceConflicts = [];
    let seatsFilled = 0;

    for (const student of meritList) {
      // Stop if we've filled the requested number of seats
      if (seatsFilled >= targetSeats) {
        break;
      }

      const existingEntries = existingStudentMap.get(student.cnic);
      
      if (!existingEntries || existingEntries.length === 0) {
        // Student doesn't exist in any merit list - add them
        newStudents.push(student);
        seatsFilled++;
      } else if (checkPreferences) {
        // Check preference conflicts
        const currentPreference = Number(student.matchedPreference);
        const hasHigherPreference = existingEntries.every(entry => 
          currentPreference < Number(entry.preference)
        );
        
        if (hasHigherPreference) {
          // This program has higher preference - add student and remove from lower preferences
          newStudents.push(student);
          seatsFilled++;
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
        message: "Merit list generated with seat filling", 
        version: newVersion,
        totalStudents: meritList.length,
        addedStudents: newStudents.length,
        skippedStudents: skippedStudents.length,
        preferenceConflicts: preferenceConflicts.length,
        removedFromOtherLists,
        targetSeats: targetSeats,
        seatsFilled: seatsFilled,
        seatsRemaining: targetSeats - seatsFilled,
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
    console.error("Error generating merit list with seat filling:", error);
    return new Response(
      JSON.stringify({ message: "Error generating merit list with seat filling", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 