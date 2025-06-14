import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const { cnic, programId } = await req.json();
    if (!cnic || !programId) {
      return new Response(JSON.stringify({ message: "CNIC and Program ID are required" }), { status: 400 });
    }
    // Remove from confirmed_seats
    await connection.execute(
      `DELETE FROM confirmed_seats WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );
    // Set confirmed = 0 in merit_list
    await connection.execute(
      `UPDATE merit_list SET confirmed = 0 WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );
    return new Response(JSON.stringify({ message: "Seat unconfirmed." }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}