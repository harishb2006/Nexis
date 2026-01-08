import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./model/user.js";
import Product from "./model/product.js";
import Order from "./model/order.js";

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create mock users
    const users = await User.create([
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: 1234567890,
        avatar: {
          public_id: "avatar1",
          url: "https://example.com/avatar1.jpg"
        }
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        phoneNumber: 9876543210,
        avatar: {
          public_id: "avatar2",
          url: "https://example.com/avatar2.jpg"
        }
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create mock products
    const products = await Product.create([
      {
        name: "iPhone 15 Pro",
        description: "Latest flagship smartphone with A17 Pro chip and titanium design",
        category: "Electronics",
        price: 999,
        stock: 50,
        email: "admin@shop.com",
        images: ["iphone15.jpg"]
      },
      {
        name: "MacBook Pro M3",
        description: "Powerful laptop for professionals with M3 chip",
        category: "Electronics",
        price: 1999,
        stock: 30,
        email: "admin@shop.com",
        images: ["macbook.jpg"]
      },
      {
        name: "AirPods Pro",
        description: "Wireless earbuds with active noise cancellation",
        category: "Electronics",
        price: 249,
        stock: 100,
        email: "admin@shop.com",
        images: ["airpods.jpg"]
      },
      {
        name: "Nike Running Shoes",
        description: "Comfortable running shoes for daily training",
        category: "Fashion",
        price: 120,
        stock: 75,
        email: "admin@shop.com",
        images: ["shoes.jpg"]
      },
      {
        name: "Levi's Jeans",
        description: "Classic denim jeans, regular fit",
        category: "Fashion",
        price: 80,
        stock: 60,
        email: "admin@shop.com",
        images: ["jeans.jpg"]
      }
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Create mock orders
    const orders = await Order.create([
      {
        user: users[0]._id,
        orderItems: [
          {
            product: products[0]._id,
            name: products[0].name,
            quantity: 1,
            price: products[0].price,
            image: products[0].images
          }
        ],
        shippingAddress: {
          country: "USA",
          city: "New York",
          address1: "123 Main St",
          address2: "Apt 4B",
          zipCode: 10001,
          addressType: "Home"
        },
        totalAmount: 999,
        orderStatus: "Processing"
      },
      {
        user: users[1]._id,
        orderItems: [
          {
            product: products[1]._id,
            name: products[1].name,
            quantity: 1,
            price: products[1].price,
            image: products[1].images
          },
          {
            product: products[2]._id,
            name: products[2].name,
            quantity: 2,
            price: products[2].price,
            image: products[2].images
          }
        ],
        shippingAddress: {
          country: "USA",
          city: "Los Angeles",
          address1: "456 Oak Ave",
          zipCode: 90001,
          addressType: "Office"
        },
        totalAmount: 2497,
        orderStatus: "Shipped"
      },
      {
        user: users[0]._id,
        orderItems: [
          {
            product: products[3]._id,
            name: products[3].name,
            quantity: 1,
            price: products[3].price,
            image: products[3].images
          }
        ],
        shippingAddress: {
          country: "USA",
          city: "Chicago",
          address1: "789 Elm St",
          zipCode: 60601,
          addressType: "Home"
        },
        totalAmount: 120,
        orderStatus: "Delivered",
        deliveredAt: new Date()
      }
    ]);
    console.log(`✅ Created ${orders.length} orders`);

    // Display order IDs for testing
    console.log("\n📋 Order IDs for testing:");
    orders.forEach((order, idx) => {
      console.log(`   Order ${idx + 1} (${order.orderStatus}): ${order._id}`);
    });

    console.log("\n✅ Database seeded successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
