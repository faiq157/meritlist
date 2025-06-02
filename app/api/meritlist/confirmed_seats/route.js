import { getConnection } from "@/lib/mysql";

export async function POST(req) {
  try {
    const { cnics } = await req.json();
    if (!Array.isArray(cnics)) {
      return new Response(JSON.stringify({ message: "CNICs array required" }), { status: 400 });
    }
    if (cnics.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    const connection = await getConnection();
    const placeholders = cnics.map(() => "?").join(",");
    const [rows] = await connection.execute(
      `SELECT cnic, program_id, program_short_name FROM confirmed_seats WHERE cnic IN (${placeholders})`,
      cnics
    );
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  const connection = await getConnection();
  try {
    const url = new URL(req.url);
    const programId = url.searchParams.get('programId');

    if (!programId) {
      return new Response(
        JSON.stringify({ message: 'Program ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if any confirmed seats exist for this program
    const [existing] = await connection.execute(
      'SELECT cnic FROM confirmed_seats WHERE program_id = ?',
      [programId]
    );
    if (existing.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No confirmed seats found for this program.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the confirmed seats for the specified program
    await connection.execute(
      'DELETE FROM confirmed_seats WHERE program_id = ?',
      [programId]
    );

    // Set lockseat and confirmed to 0 in merit_list for this program
    await connection.execute(
      'UPDATE merit_list SET lockseat = 0, confirmed = 0 WHERE program_id = ?',
      [programId]
    );

    return new Response(
      JSON.stringify({ message: 'Confirmed seats deleted and merit list updated successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting confirmed seats:', error);
    return new Response(
      JSON.stringify({ message: 'Error deleting confirmed seats', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}