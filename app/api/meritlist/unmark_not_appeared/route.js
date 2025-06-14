import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  const connection = await getConnection();
  try {
    const { cnic, programId } = await req.json();
    if (!cnic || !programId) {
      return new Response(JSON.stringify({ message: "CNIC and Program ID are required" }), { status: 400 });
    }
    await connection.execute(
      `UPDATE merit_list SET not_appeared = 0 WHERE cnic = ? AND program_id = ?`,
      [cnic, programId]
    );
    return new Response(JSON.stringify({ message: "Not appeared status removed." }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}