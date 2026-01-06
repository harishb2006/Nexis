import express from "express";
import ErrorHandler from "./middleware/error.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import product from './controller/product.js';
import path from 'path';
import { fileURLToPath } from 'url';
import orders from './controller/orders.js';
import user from "./controller/user.js";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// const corsOptions = {
//     origin: 'http://localhost:5173', // Allow only your frontend origin
//     credentials: true, // Allow cookies and credentials
//   };


const allowedOrigins = [
  'http://localhost:5173',
   'https://ecommerce-follow-along-1-5pwu.onrender.com'

];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('CORS policy: The origin is not allowed'), false); // Reject the request
    }
  },
  credentials: true, // Allow cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
};

app.use(cors(corsOptions));


// const allowedOrigins = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(',')
//   : [];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS policy: The origin is not allowed'), false);
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// };

// app.use(cors(corsOptions));




app.use(express.json());
app.use(cookieParser());
app.use("/",express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Configuration for environment variables
if (process.env.NODE_ENV !== "PRODUCTION") {
    // Load environment variables from the .env file if the environment is not production
    dotenv.config({
        path: "backend/config/.env",
    });
}
// Serve static files for uploads and products
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/products', express.static(path.join(__dirname, 'products')));

//import Routes
app.use("/api/v2/user", user);
app.use("/api/v2/product", product);
app.use("/api/v2/orders", orders);
app.use(ErrorHandler);
export default app;