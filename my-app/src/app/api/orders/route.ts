import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { withErrorHandler, getUserFromRequest, requireSeller } from "@/lib/error-handler";
import { validateData, createOrderSchema } from "@/lib/validations";

const sql = postgres(process.env.NEON_POSTGRES_URL!, { ssl: "require" });

async function getOrders(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let orders;

  if (user.role === 'seller' && user.seller_id) {
    // Sellers see orders for their products
    orders = await sql`
      SELECT o.id, o.total_price, o.status, o.created_at,
             u.name as buyer_name, u.email as buyer_email,
             s.name as seller_name,
             json_agg(
               json_build_object(
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'product_name', p.name
               )
             ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN sellers s ON o.seller_id = s.seller_id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.seller_id = ${user.seller_id}
      GROUP BY o.id, o.total_price, o.status, o.created_at, u.name, u.email, s.name
      ORDER BY o.created_at DESC
    `;
  } else {
    // Buyers see their own orders
    orders = await sql`
      SELECT o.id, o.total_price, o.status, o.created_at,
             s.name as seller_name,
             json_agg(
               json_build_object(
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price_at_time', oi.price_at_time,
                 'product_name', p.name
               )
             ) as items
      FROM orders o
      JOIN sellers s ON o.seller_id = s.seller_id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ${user.user_id}
      GROUP BY o.id, o.total_price, o.status, o.created_at, s.name
      ORDER BY o.created_at DESC
    `;
  }

  return NextResponse.json(orders, { status: 200 });
}

async function createOrder(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role === 'seller') {
    return NextResponse.json({ error: "Buyers only" }, { status: 403 });
  }

  const body = await req.json();

  const validation = validateData(createOrderSchema, body);
  if (!validation.success) {
    throw validation.errors;
  }

  const { seller_id, items } = validation.data;

  // Calculate total price and validate items
  let totalPrice = 0;
  const orderItems: Array<{ product_id: string; quantity: number; price_at_time: number }> = [];

  for (const item of items) {
    const product = await sql`
      SELECT price, stock, seller_id FROM products WHERE id = ${item.product_id}
    `;

    if (product.length === 0) {
      return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
    }

    if (product[0].seller_id !== seller_id) {
      return NextResponse.json({ error: "All items must be from the same seller" }, { status: 400 });
    }

    if (product[0].stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for product ${item.product_id}` }, { status: 400 });
    }

    totalPrice += product[0].price * item.quantity;
    orderItems.push({
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: product[0].price,
    });
  }

  // Create order in transaction
  const order = await sql.begin(async (tx) => {
    // Insert order
    const newOrder = await tx`
      INSERT INTO orders (user_id, seller_id, total_price)
      VALUES (${user.user_id}, ${seller_id}, ${totalPrice})
      RETURNING id, total_price, status, created_at
    `;

    // Insert order items
    for (const item of orderItems) {
      await tx`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
        VALUES (${newOrder[0].id}, ${item.product_id}, ${item.quantity}, ${item.price_at_time})
      `;

      // Update product stock
      await tx`
        UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product_id}
      `;
    }

    return newOrder[0];
  });

  return NextResponse.json(order, { status: 201 });
}

export const GET = withErrorHandler(getOrders);
export const POST = withErrorHandler(createOrder);