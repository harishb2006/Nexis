/**
 * Product Tools
 * Tools for product search and inventory management
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Product from "../../model/product.js";
import { ensureConnection, isValidObjectId } from "../utils/database.js";

/**
 * Search Products
 * Search products by name, description, or category
 */
export const searchProducts = tool(
  async ({ query, category, limit = 10 }) => {
    await ensureConnection();

    // Require at least a query or category
    if (!query && !category) {
      return JSON.stringify({
        success: false,
        message: "Please specify what product you're looking for",
      });
    }

    try {
      let filter = {};

      if (query && category) {
        // Search with category filter
        filter = {
          $and: [
            {
              $or: [
                { name: { $regex: new RegExp(query, "i") } },
                { description: { $regex: new RegExp(query, "i") } },
                { category: { $regex: new RegExp(query, "i") } },
              ],
            },
            { category: { $regex: new RegExp(category, "i") } },
          ],
        };
      } else if (query) {
        // Search by query in name, description, or category
        filter = {
          $or: [
            { name: { $regex: new RegExp(query, "i") } },
            { description: { $regex: new RegExp(query, "i") } },
            { category: { $regex: new RegExp(query, "i") } },
          ],
        };
      } else if (category) {
        // Filter by category only
        filter.category = { $regex: new RegExp(category, "i") };
      }

      const products = await Product.find(filter)
        .select("name category price stock description images tags")
        .limit(limit)
        .lean();

      if (products.length === 0) {
        return JSON.stringify({
          success: false,
          message: "No products found matching your search",
        });
      }

      return JSON.stringify({
        success: true,
        count: products.length,
        products: products.map((p) => ({
          id: p._id,
          name: p.name,
          category: p.category,
          description: p.description,
          price: `$${p.price}`,
          inStock: p.stock > 0,
          stockCount: p.stock,
          images: p.images || [],
          tags: p.tags || [],
          url: `http://localhost:5173/product/${p._id}`,
        })),
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: "Error searching products",
      });
    }
  },
  {
    name: "search_products",
    description:
      "Search for products by name, description, or category. ALWAYS provide a specific 'query' parameter with keywords. Examples: 'laptop', 'shoes', 'iphone'.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "REQUIRED: Search keyword extracted from user's question (e.g., 'laptop', 'shoes')"
        ),
      category: z
        .string()
        .optional()
        .describe("Optional category filter (Electronics, Fashion, etc)"),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Max products to return (default: 10)"),
    }),
  }
);

/**
 * Update Product Stock
 * Adjusts inventory levels for a product
 */
export const updateProductStock = tool(
  async ({ productId, newStock }) => {
    await ensureConnection();

    if (!isValidObjectId(productId)) {
      return JSON.stringify({
        success: false,
        message: "Invalid product ID format",
      });
    }

    if (newStock < 0) {
      return JSON.stringify({
        success: false,
        message: "Stock quantity cannot be negative",
      });
    }

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return JSON.stringify({
          success: false,
          message: "Product not found",
        });
      }

      product.stock = newStock;
      await product.save();

      return JSON.stringify({
        success: true,
        message: `Stock updated for ${product.name}`,
        productName: product.name,
        newStock: product.stock,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        message: "Failed to update stock",
      });
    }
  },
  {
    name: "update_product_stock",
    description:
      "Update product inventory/stock. Use when admin wants to adjust stock levels.",
    schema: z.object({
      productId: z.string().describe("The product ID to update"),
      newStock: z.number().describe("New stock quantity"),
    }),
  }
);

export const productTools = [searchProducts, updateProductStock];

export default productTools;
