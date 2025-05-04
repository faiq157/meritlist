import { getConnection } from "@/lib/mysql";

// Handle GET request to fetch weightages
export async function GET(req) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute("SELECT * FROM merit_weights");
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching weightages:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching weightages", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Handle PUT request to update weightages
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ssc_weight, inter_weight, test_weight } = body;

    // Validate input
    if (!id || typeof id !== "number") {
      return new Response(
        JSON.stringify({ message: "ID is required and must be a number." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (
      ssc_weight === undefined ||
      inter_weight === undefined ||
      test_weight === undefined || 0.0
    ) {
      return new Response(
        JSON.stringify({ message: "All weight fields are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const connection = await getConnection();
    const [result] = await connection.execute(
      `UPDATE merit_weights 
       SET ssc_weight = ?, inter_weight = ?, test_weight = ? 
       WHERE id = ?`,
      [ssc_weight, inter_weight, test_weight, id]
    );

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ message: "No record found with the given ID." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Weightages updated successfully." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating weightages:", error);
    return new Response(
      JSON.stringify({ message: "Error updating weightages", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}