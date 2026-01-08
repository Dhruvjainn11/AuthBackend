const express = require('express');
const app = express();
const pool = require('./src/config/mysql');
const errorMiddleware = require('./src/middlewares/errorMiddleware');
const cookieParser = require('cookie-parser');
const routes = require('./src/routes/index');

require("dotenv").config();
app.use(express.json());
app.use(cookieParser())
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
 res.send('Server is running');
});   

// load ALL routes
app.use("/api", routes);

app.use(errorMiddleware);

pool.query("SELECT 1")
  .then(() => console.log("✅ MySQL connected"))
  .catch(() => console.log("❌ MySQL connection failed"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

