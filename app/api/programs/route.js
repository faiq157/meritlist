import { getConnection } from "@/lib/mysql";

// Handle GET requests
export async function GET(req) {
  try {
    console.log("Fetching all programs...");
    const connection = await getConnection();

    const [rows] = await connection.execute("SELECT * FROM programs");
    // Parse seat fields as integers for frontend consistency
    const programs = rows.map(row => ({
      ...row,
      seats_open: row.seats_open !== undefined ? Number(row.seats_open) : 0,
      seats_self_finance: row.seats_self_finance !== undefined ? Number(row.seats_self_finance) : 0,
      seats_rational: row.seats_rational !== undefined ? Number(row.seats_rational) : 0,
    }));
    console.log("Programs fetched successfully:", programs);

    return new Response(JSON.stringify(programs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching programs", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Handle POST requests (Create a new program)
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, programType, short_name, seats_open = 0, seats_self_finance = 0, seats_rational = 0 } = body;

    // Validate input
    if (!name || typeof name !== "string") {
      return new Response(
        JSON.stringify({ message: "Program name is required and must be a string." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!short_name || typeof short_name !== "string") {
      return new Response(
        JSON.stringify({ message: "Short name is required and must be a string." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Creating new program:", { name, description, programType, short_name, seats_open, seats_self_finance, seats_rational });
    const connection = await getConnection();

    const [result] = await connection.execute(
      `INSERT INTO programs (name, description, programType, short_name, seats_open, seats_self_finance, seats_rational) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, programType || "General", short_name, seats_open, seats_self_finance, seats_rational]
    );

    console.log("Program created successfully with ID:", result.insertId);

    return new Response(
      JSON.stringify({ message: "Program created successfully", id: result.insertId }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating program:", error);
    return new Response(
      JSON.stringify({ message: "Error creating program", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Handle PUT requests (Update a program)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, description, programType, short_name, seats_open, seats_self_finance, seats_rational } = body;

    // Validate input
    if (!id || typeof id !== "number") {
      return new Response(
        JSON.stringify({ message: "Program ID is required and must be a number." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!name || typeof name !== "string") {
      return new Response(
        JSON.stringify({ message: "Program name is required and must be a string." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!short_name || typeof short_name !== "string") {
      return new Response(
        JSON.stringify({ message: "Short name is required and must be a string." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Updating program:", { id, name, description, programType, short_name, seats_open, seats_self_finance, seats_rational });
    const connection = await getConnection();

    const [result] = await connection.execute(
      `UPDATE programs 
       SET name = ?, 
           description = ?, 
           programType = ?, 
           short_name = ?,
           seats_open = ?,
           seats_self_finance = ?,
           seats_rational = ?
       WHERE id = ?`,
      [name, description || null, programType || "General", short_name, seats_open ?? 0, seats_self_finance ?? 0, seats_rational ?? 0, id]
    );

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ message: "No program found with the given ID." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Program updated successfully.");
    return new Response(
      JSON.stringify({ message: "Program updated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating program:", error);
    return new Response(
      JSON.stringify({ message: "Error updating program", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Handle DELETE requests (Delete a program)
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get("id"), 10);

    // Validate input
    if (!id || isNaN(id)) {
      return new Response(
        JSON.stringify({ message: "Program ID is required and must be a valid number." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Deleting program with ID:", id);
    const connection = await getConnection();

    const [result] = await connection.execute(
      "DELETE FROM programs WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ message: "No program found with the given ID." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Program deleted successfully.");
    return new Response(
      JSON.stringify({ message: "Program deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Check for foreign key constraint error
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.errno === 1451) {
      return new Response(
        JSON.stringify({
          message: "Cannot delete this program because it has related merit list entries. Please delete all related merit lists first.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Error deleting program:", error);
    return new Response(
      JSON.stringify({ message: "Error deleting program", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}