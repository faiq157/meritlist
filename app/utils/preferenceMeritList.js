import { getConnection } from "@/lib/mysql";

/**
 * Check if a student already exists in other merit lists
 * @param {string} cnic - Student's CNIC
 * @param {number} currentProgramId - Current program ID
 * @returns {Promise<Array>} Array of existing merit list entries
 */
export async function checkExistingMeritListEntries(cnic, currentProgramId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT program_id, program_short_name, matched_preference 
       FROM merit_list 
       WHERE cnic = ? AND program_id != ?`,
      [cnic, currentProgramId]
    );
    return rows;
  } catch (error) {
    console.error("Error checking existing merit list entries:", error);
    throw error;
  }
}

/**
 * Check if a student should be included in the current merit list based on preferences
 * @param {string} cnic - Student's CNIC
 * @param {number} currentPreference - Current program preference
 * @param {number} currentProgramId - Current program ID
 * @returns {Promise<boolean>} True if student should be included
 */
export async function shouldIncludeInMeritList(cnic, currentPreference, currentProgramId) {
  const existingEntries = await checkExistingMeritListEntries(cnic, currentProgramId);
  
  // If no existing entries, include the student
  if (existingEntries.length === 0) {
    return true;
  }
  
  // Check if current preference is higher (lower number) than all existing preferences
  const hasHigherPreference = existingEntries.every(entry => 
    currentPreference < Number(entry.matched_preference)
  );
  
  return hasHigherPreference;
}

/**
 * Remove student from lower preference merit lists
 * @param {string} cnic - Student's CNIC
 * @param {number} currentPreference - Current program preference
 * @param {number} currentProgramId - Current program ID
 * @returns {Promise<number>} Number of entries removed
 */
export async function removeFromLowerPreferenceLists(cnic, currentPreference, currentProgramId) {
  const connection = await getConnection();
  try {
    const existingEntries = await checkExistingMeritListEntries(cnic, currentProgramId);
    let removedCount = 0;
    
    for (const entry of existingEntries) {
      if (currentPreference < Number(entry.matched_preference)) {
        await connection.execute(
          `DELETE FROM merit_list WHERE cnic = ? AND program_id = ?`,
          [cnic, entry.program_id]
        );
        removedCount++;
      }
    }
    
    return removedCount;
  } catch (error) {
    console.error("Error removing from lower preference lists:", error);
    throw error;
  }
}

/**
 * Filter merit list to only include students with high preferences (1,2,3,4)
 * @param {Array} meritList - Array of merit list entries
 * @returns {Array} Filtered merit list
 */
export function filterHighPreferenceStudents(meritList) {
  return meritList.filter(student => 
    [1, 2, 3, 4].includes(Number(student.matched_preference))
  );
}

/**
 * Get the highest preference for a student across all merit lists
 * @param {string} cnic - Student's CNIC
 * @returns {Promise<Object|null>} Highest preference entry or null
 */
export async function getHighestPreferenceForStudent(cnic) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT program_id, program_short_name, matched_preference, \`rank\`
       FROM merit_list 
       WHERE cnic = ?
       ORDER BY matched_preference ASC, \`rank\` ASC
       LIMIT 1`,
      [cnic]
    );
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getting highest preference for student:", error);
    throw error;
  }
}

/**
 * Get all merit list entries for a student across all programs
 * @param {string} cnic - Student's CNIC
 * @returns {Promise<Array>} Array of merit list entries
 */
export async function getAllMeritListEntriesForStudent(cnic) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT program_id, program_short_name, matched_preference, \`rank\`, version
       FROM merit_list 
       WHERE cnic = ?
       ORDER BY matched_preference ASC, \`rank\` ASC`,
      [cnic]
    );
    
    return rows;
  } catch (error) {
    console.error("Error getting all merit list entries for student:", error);
    throw error;
  }
} 