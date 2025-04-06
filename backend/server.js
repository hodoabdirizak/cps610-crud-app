const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config({ path: '../backend/.env'});

// Initialize the app
const app = express();
app.use(bodyParser.json());

const dbURI = process.env.DB_URI;

const cors = require('cors');
app.use(cors())


// Connect to MongoDB
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Successfully connected to database');
}).catch(err => {
    console.log('❌ error connecting to database: ', err);
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const Customer = require('./models/Customer');

// Create a new customer
app.post('/customers', async (req, res) => {
    const { name, email, phone_number, company, tier } = req.body;
    try {
        const newCustomer = await Customer.create({ name, email, phone_number, company, tier });
        res.status(201).json(newCustomer);
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});

// Get all customers
app.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

// Get a specific customer
app.get('/customers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const customer = await Customer.findById(id);
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

// Update a specific customer
app.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone_number, company, tier } = req.body;

    // Validate the incoming data
    if (!name || !email || !phone_number || !tier) {
        return res.status(400).json({ error: 'Missing required fields: name, email, phone_number, and tier.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            { name, email, phone_number, company, tier },
            { new: true }  // Return the updated document
        );

        if (!updatedCustomer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        res.status(200).json(updatedCustomer);  // Return the updated customer data
    } catch (err) {
        console.error('Error updating customer:', err);
        res.status(500).json({ error: 'Error updating customer. Please try again later.' });
    }
});

// Delete a customer
app.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;

    try {

        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }


        await Customer.findByIdAndDelete(id);

        res.status(200).json({ message: 'Customer deleted successfully' });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
