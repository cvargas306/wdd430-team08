import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      product_id: 1,
      name: "Handwoven Ceramic Bowl",
      price: 85,
      seller: "Clay & Light Studio",
      rating: 4.7,
      reviews: 124,
      category: "Ceramics",
      image_url:
        "https://res.cloudinary.com/dtqr67txk/image/upload/v1764206396/ceramic-bowl-img_d4kz0q.png",
    },
    {
      product_id: 2,
      name: "Organic Linen Throw Pillow",
      price: 65,
      seller: "Sustainable Textile Co",
      rating: 4.5,
      reviews: 98,
      category: "Textiles",
      image_url:
        "https://res.cloudinary.com/dtqr67txk/image/upload/v1764206410/linen-pillow-img_mcpy75.png",
    },
    {
      product_id: 3,
      name: "Artisan Wood Cutting Board",
      price: 95,
      seller: "Forest & Grain Workshop",
      rating: 4.8,
      reviews: 156,
      category: "Woodcraft",
      image_url:
        "https://res.cloudinary.com/dtqr67txk/image/upload/v1764206406/cutting-board-img_xzmlgq.png",
    }
  ]);
}


