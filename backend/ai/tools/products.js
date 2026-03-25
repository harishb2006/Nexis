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

      // 1. Clean the query
      const stopWords = ['suggest', 'me', 'a', 'an', 'the', 'for', 'want', 'looking', 'some', 'any', 'product', 'products', 'to', 'buy'];
      const keywords = query
        ? query.toLowerCase().split(' ').filter(word => !stopWords.includes(word) && word.length > 2)
        : [];
      const cleanRegexes = keywords.map(kw => new RegExp(kw, "i"));

      if (query && category) {
        // Search with category filter
        filter = {
          $and: [
            {
              $or: [
                { name: { $in: cleanRegexes.length ? cleanRegexes : [new RegExp(query, "i")] } },
                { description: { $in: cleanRegexes.length ? cleanRegexes : [new RegExp(query, "i")] } },
                { tags: { $in: cleanRegexes.length ? cleanRegexes : [new RegExp(query, "i")] } },
                { category: { $in: cleanRegexes.length ? cleanRegexes : [new RegExp(query, "i")] } },
              ],
            },
            { category: { $regex: new RegExp(category, "i") } },
          ],
        };
      } else if (query) {
        // Search by query in name, description, tags, or category
        const regexes = cleanRegexes.length ? cleanRegexes : [new RegExp(query, "i")];
        filter = {
          $or: [
            { name: { $in: regexes } },
            { description: { $in: regexes } },
            { tags: { $in: regexes } },
            { category: { $in: regexes } },
          ],
        };
      } else if (category) {
        // Filter by category only
        filter.category = { $regex: new RegExp(category, "i") };
      }

      console.log("Searching products with filter:", JSON.stringify(filter));

      const products = await Product.find(filter)
        .select("name category price stock description images tags sales")
        .sort({ sales: -1 })
        .limit(limit)
        .lean();

      if (products.length === 0) {
        return JSON.stringify({
          success: false,
          message: `No products found matching '${query}'`,
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
          sales: p.sales || 0,
          images: p.images || [],
          tags: p.tags || [],
          url: `http://localhost:5173/product/${p._id}`,
        })),
      });
    } catch (error) {
      console.error("Error in AI product search:", error);
      return JSON.stringify({
        success: false,
        message: "Error searching products",
      });
    }
  },
  {
    name: "search_products",
    description:
      "Search for products by name, description, tags, or category. ALWAYS extract the CORE keyword or problem from the user's sentence. Do NOT use full sentences. Example: if user says 'suggest me a phone', pass 'phone'. If user says 'something for dry skin', pass 'dry skin'. The results are automatically sorted by highest sales.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "REQUIRED: Core search keyword extracted from user's question, problems, or symptoms (e.g., 'pimples', 'phone', 'dry skin'). Do NOT include phrases like 'suggest me' or 'I want'."
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
