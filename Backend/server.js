const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const cartRoutes = require('./routes/cartRoutes')
const ordersRoutes=require("./routes/orderRoutes");
const path = require('path');



// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/cart",cartRoutes)
app.use("/api/orders",ordersRoutes)
// Add these after your other middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add prescription routes
app.use('/api/prescription', require('./routes/prescriptionRoutes'));


// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Online Pharmacy API is running!' });
});

console.log("coming here");



// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        requestedPath: req.originalUrl 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});