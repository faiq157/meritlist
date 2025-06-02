import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const { cnic, program_id, program_short_name } = await req.json();
    if (!cnic || !program_id) {
      return new Response(JSON.stringify({ message: "CNIC and program_id are required" }), { status: 400 });
    }

    // Insert into cancelled_meritlist
    await connection.execute(
      `INSERT INTO cancelled_meritlist (cnic, program_id, program_short_name) VALUES (?, ?, ?)`,
      [cnic, program_id, program_short_name]
    );

    // Remove from merit_list
    await connection.execute(
      `DELETE FROM merit_list WHERE cnic = ? AND program_id = ?`,
      [cnic, program_id]
    );

    // Optionally, also remove from confirmed_seats
    await connection.execute(
      `DELETE FROM confirmed_seats WHERE cnic = ? AND program_id = ?`,
      [cnic, program_id]
    );

    return new Response(JSON.stringify({ message: "Admission cancelled and student removed from merit list." }), { status: 200 });
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