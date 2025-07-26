import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const { cnic, program_id, program_short_name } = await req.json();
    if (!cnic) {
      return new Response(JSON.stringify({ message: "CNIC is required" }), { status: 400 });
    }

    // Insert into cancelled_meritlist only if not already present
    await connection.execute(
      `INSERT IGNORE INTO cancelled_meritlist (cnic, program_id, program_short_name) VALUES (?, ?, ?)`,
      [cnic, program_id, program_short_name]
    );

    // Remove from ALL merit_list entries (all departments)
    await connection.execute(
      `DELETE FROM merit_list WHERE cnic = ?`,
      [cnic]
    );

    // Optionally, also remove from confirmed_seats
    await connection.execute(
      `DELETE FROM confirmed_seats WHERE cnic = ?`,
      [cnic]
    );

    return new Response(JSON.stringify({ message: "Admission cancelled and student removed from all merit lists." }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}

export async function GET(req) {
  const connection = await getConnection();
  try {
    const url = new URL(req.url);
    const programId = url.searchParams.get('programId');
    if (!programId) {
      return new Response(JSON.stringify({ message: "Program ID is required" }), { status: 400 });
    }
    const [rows] = await connection.execute(
      `SELECT cnic, program_id, program_short_name, cancelled_at FROM cancelled_meritlist WHERE program_id = ?`,
      [programId]
    );
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}