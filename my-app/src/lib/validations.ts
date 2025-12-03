import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  is_seller: z.boolean().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  years_active: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().optional(),
  followers: z.number().optional(),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Product description is required'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  description: z.string().min(1, 'Product description is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
});

// Seller schemas
export const createSellerSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  name: z.string().min(1, 'Seller name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
});

export const updateSellerSchema = z.object({
  name: z.string().min(1, 'Seller name is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
  years_active: z.number().int().min(0).optional(),
  followers: z.number().int().min(0).optional(),
  image: z.string().url('Invalid image URL').optional(),
});

// Order schemas
export const createOrderSchema = z.object({
  seller_id: z.string().uuid('Invalid seller ID'),
  items: z.array(z.object({
    product_id: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
  })).min(1, 'Order must contain at least one item'),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
});

// Review schemas
export const createReviewSchema = z.object({
  seller_id: z.string().uuid('Invalid seller ID'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long'),
});

// Utility function to validate and parse
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}