require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User     = require("../models/User");
const Customer = require("../models/Customer");
const Trip     = require("../models/Trip");
const Payment  = require("../models/Payment");
const Counter  = require("../models/Counter");

const connectDB = require("./db");

const seed = async () => {
  await connectDB();

  console.log("🌱 Seeding Shrinath Water Distributors...");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Trip.deleteMany({}),
    Payment.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  // Create owner
  const owner = await User.create({
    name: "Shrinath Owner",
    phone: "9999999999",
    password: "owner123",
    role: "owner",
  });

  // Create drivers — now with owner reference
  const [d1, d2] = await Promise.all([
    User.create({ name:"Ramesh Kumar",  phone:"9876543210", password:"driver123", role:"driver", owner:owner._id, vehicle:"MH-10 AB 1234", license:"MH-1234567", rating:4.8 }),
    User.create({ name:"Suresh Patil",  phone:"9876543211", password:"driver456", role:"driver", owner:owner._id, vehicle:"MH-10 CD 5678", license:"MH-7654321", rating:4.5 }),
  ]);

  // Create customers
  const customers = await Customer.insertMany([
    { owner:owner._id, name:"Vijay Sharma",   phone:"9001001001", address:"123 MG Road, Nashik",      tankSize:"1000 Litre", totalDue:500  },
    { owner:owner._id, name:"Priya Mehta",    phone:"9001001002", address:"45 Panchavati, Nashik",    tankSize:"500 Litre",  totalDue:0    },
    { owner:owner._id, name:"Anil Deshmukh",  phone:"9001001003", address:"78 College Road, Nashik",  tankSize:"2000 Litre", totalDue:1200 },
    { owner:owner._id, name:"Sunita Jadhav",  phone:"9001001004", address:"12 Cidco Colony, Nashik",  tankSize:"1000 Litre", totalDue:300  },
    { owner:owner._id, name:"Ravi Kulkarni",  phone:"9001001005", address:"56 Gangapur Road, Nashik", tankSize:"1000 Litre", totalDue:0    },
  ]);

  // Create trips
  const trips = await Promise.all([
    Trip.create({ owner:owner._id, driver:d1._id, customer:customers[0]._id, address:customers[0].address, tanks:2, amount:400, status:"delivered", isPaid:false, deliveredAt:new Date() }),
    Trip.create({ owner:owner._id, driver:d2._id, customer:customers[1]._id, address:customers[1].address, tanks:1, amount:200, status:"delivered", isPaid:true,  deliveredAt:new Date() }),
    Trip.create({ owner:owner._id, driver:d1._id, customer:customers[2]._id, address:customers[2].address, tanks:3, amount:600, status:"pending",   isPaid:false }),
    Trip.create({ owner:owner._id, driver:d2._id, customer:customers[3]._id, address:customers[3].address, tanks:2, amount:400, status:"on-way",    isPaid:false, startedAt:new Date() }),
    Trip.create({ owner:owner._id, driver:d1._id, customer:customers[4]._id, address:customers[4].address, tanks:1, amount:200, status:"delivered", isPaid:true,  deliveredAt:new Date() }),
  ]);

  console.log(`✅ Created: 1 owner, 2 drivers, ${customers.length} customers, ${trips.length} trips`);
  console.log("\n🔐 Login credentials:");
  console.log("   Owner  → phone: 9999999999  | password: owner123");
  console.log("   Driver → phone: 9876543210  | password: driver123");
  console.log("   Driver → phone: 9876543211  | password: driver456");

  mongoose.connection.close();
};

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
