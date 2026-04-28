const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const mongoSanitize = require("@exortek/express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const hotels = require("./routes/hotels");
const auth = require("./routes/auth");
const bookings = require("./routes/bookings");
const users = require("./routes/users");
const reviews = require("./routes/reviews");
const roomservices = require("./routes/roomservices");

const app = express();

/*
  Security headers:
  - frameguard: blocks clickjacking with X-Frame-Options: DENY
  - contentSecurityPolicy: adds CSP header for all responses
  - frameAncestors: modern clickjacking protection inside CSP
*/
app.use(
  helmet({
    frameguard: { action: "deny" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://drive.google.com"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"]
      }
    }
  })
);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize MongoDB query/operator injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10000000
});
app.use(limiter);

// Prevent HTTP parameter pollution
app.use(hpp());

// Enable CORS
const corsOptions = {
  origin: (process.env.FRONTEND_URL || "http://localhost:3000").split(","),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
};
app.use(cors(corsOptions));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Hotel Booking API",
      version: "1.0.0",
      description: "A simple Express Hotel Booking API"
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        Hotel: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            address: { type: "string" },
            district: { type: "string" },
            province: { type: "string" },
            postalcode: { type: "string" },
            tel: { type: "string" },
            region: { type: "string" },
            picture: { type: "string" },
            dailyrate: { type: "number" }
          },
          example: {
            name: "White Park City Hall",
            address: "10 Coleman Street",
            district: "Downtown Core",
            province: "Singapore",
            postalcode: "17989",
            tel: "+65 6336 3456",
            region: "Central",
            picture: "https://drive.google.com/uc?id=1O5DM3dJrKbUFCHAY8BTlx_Ky63dHvY8W",
            dailyrate: 2500
          }
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            apptDate: { type: "string", format: "date-time" },
            user: { type: "string" },
            hotel: { type: "string" },
            services: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  service: { type: "string" },
                  status: { type: "string", enum: ["pending", "done", "cancelled"] },
                  count: { type: "number" }
                }
              }
            }
          },
          example: {
            apptDate: "2026-03-18T00:00:00.000Z",
            user: "69c0c34975154ee40a46f68c",
            hotel: "69be6cb8cbaa281bfca363ab",
            services: []
          }
        },
        Review: {
          type: "object",
          properties: {
            _id: { type: "string" },
            score: { type: "number", minimum: 1, maximum: 5 },
            comment: { type: "string" },
            user: { type: "string" },
            hotel: { type: "string" },
            likes: { type: "array", items: { type: "string" } },
            dislikes: { type: "array", items: { type: "string" } }
          },
          example: {
            score: 3,
            comment: "No Sheep ToT",
            user: "69eefb65fcddb633ab7d2a73",
            hotel: "69be6cb8cbaa281bfca363b4"
          }
        },
        RoomService: {
          type: "object",
          properties: {
            _id: { type: "string" },
            hotel: { type: "string", nullable: true },
            name: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["available", "pending"] },
            minQuantity: { type: "number" },
            maxQuantity: { type: "number" }
          },
          example: {
            hotel: "69be6cb8cbaa281bfca363af",
            name: "Extra Blanket",
            description: "ผ้าห่มเพิ่มเติมสำหรับความอบอุ่นในห้องพัก",
            status: "available",
            minQuantity: 1,
            maxQuantity: 20
          }
        },
        User: {
          type: "object",
          required: ["name", "email", "tel", "password"],
          properties: {
            _id: {
              type: "string",
              description: "The auto-generated id of the user"
            },
            name: {
              type: "string",
              description: "User name"
            },
            email: {
              type: "string",
              format: "email",
              description: "User email (must be unique)",
              example: "user@example.com"
            },
            tel: {
              type: "string",
              description: "User telephone number"
            },
            role: {
              type: "string",
              enum: ["user", "admin", "PomPhet"],
              default: "user",
              description: "User role"
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User password (min 6 characters)",
              writeOnly: true
            },
            isban: {
              type: "boolean",
              default: false,
              description: "Whether the user is banned"
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "The date the user was created"
            }
          },
          example: {
            name: "Test User",
            email: "testuser@example.com",
            tel: "0812345678",
            role: "user",
            password: "password123"
          }
        }
      }
    }
  },
  apis: ["./routes/*.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount routers
app.use("/api/v1/hotels", hotels);
app.use("/api/v1/auth", auth);
app.use("/api/v1/bookings", bookings);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);
app.use("/api/v1/roomservices", roomservices);

// Query parser
app.set("query parser", "extended");

const PORT = process.env.PORT || 5000;

// Start server only when not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  // Do not call process.exit() on Vercel
});