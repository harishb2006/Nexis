import mongoose from "mongoose";
import User from "./model/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables from .env (not config/.env)
dotenv.config({ path: ".env" });

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  console.error("❌ Error: DB_URL not found in .env file");
  process.exit(1);
}

console.log("📡 Connecting to:", DB_URL.substring(0, 30) + "...");

/**
 * Script to create an admin user
 * Usage: node createAdmin.js <email> <password> <name>
 * Example: node createAdmin.js admin@shophub.com admin123 "Admin User"
 */

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(DB_URL);
    console.log("✅ Connected to MongoDB");

    // Get arguments from command line
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log("\n❌ Error: Missing required arguments");
      console.log("\nUsage: node createAdmin.js <email> <password> <name>");
      console.log('Example: node createAdmin.js admin@shophub.com admin123 "Admin User"');
      console.log("\n");
      process.exit(1);
    }

    const [email, password, name] = args;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log(`\n⚠️  Admin user already exists with email: ${email}`);
        console.log("✅ User is already an admin\n");
        process.exit(0);
      } else {
        // Update existing user to admin
        existingUser.role = "admin";
        await existingUser.save();
        console.log(`\n✅ Updated existing user to admin role: ${email}\n`);
        process.exit(0);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user with explicit password field
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      avatar: {
        public_id: "default-admin",
        url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      },
    });

    // Save the user (this ensures password is saved even with select: false)
    await adminUser.save({ validateBeforeSave: false });

    console.log("\n🎉 Admin user created successfully!");
    console.log("===================================");
    console.log(`Email: ${adminUser.email}`);
    console.log(`Name: ${adminUser.name}`);
    console.log(`Role: ${adminUser.role}`);
    console.log("===================================");
    console.log("\n✅ You can now login with these credentials\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error.message);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
