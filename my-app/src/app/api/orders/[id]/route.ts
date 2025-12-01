import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, getUserFromRequest, requireSeller } from "@/lib/error-handler";
import { validateData, updateOrderSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function updateOrder(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const validation = validateData(updateOrderSchema, body);
  if (!validation.success) {
    throw validation.errors;
  }

  const { status } = validation.data;

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  // Check if order exists and user has permission
  const order = await sql`
    SELECT seller_id, user_id FROM orders WHERE id = ${id}
  `;

  if (order.length === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Sellers can update orders for their products, buyers can update their own orders (limited)
  if (user.role === 'seller') {
    if (order[0].seller_id !== user.seller_id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  } else {
    if (order[0].user_id !== user.user_id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    // Buyers can only cancel orders
    if (status !== 'cancelled') {
      return NextResponse.json({ error: "Buyers can only cancel orders" }, { status: 403 });
    }
  }

  const updatedOrder = await sql`
    UPDATE orders SET status = ${status} WHERE id = ${id}
    RETURNING id, total_price, status, created_at
  `;

  return NextResponse.json(updatedOrder[0], { status: 200 });
}

export const PUT = withErrorHandler(updateOrder);