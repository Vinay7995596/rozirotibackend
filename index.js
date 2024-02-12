const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express()
const server = require('http').createServer(app)

const port =  3000;

app.use(express.json());
app.use(cors()); // Enable CORS

const connection = mysql.createConnection({
  host: 'sql306.infinityfree.com',
  user: 'if0_35960116',
  password: 'LMIBPULvc80x',
  database: 'if0_35960116_vinay'
});

connection.connect();

// Fetch all transactions
app.get('/transactions', (req, res) => {
  const query = 'SELECT * FROM transactions';
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error fetching transactions');
      return;
    }
    res.json(results);
  });
});

// Add a transaction
app.post('/transaction', (req, res) => {
  const { date, type, amount } = req.body;
  
  // Fetch the latest transaction to get the previous remaining amount
  const selectQuery = 'SELECT remaining_amount FROM transactions ORDER BY id DESC LIMIT 1';
  connection.query(selectQuery, (err, selectResult) => {
    if (err) {
      
      res.status(500).send('Error fetching remaining amount');
      return;
    }

    let previousRemainingAmount = 0;
    if (selectResult.length > 0) {
      previousRemainingAmount = parseFloat(selectResult[0].remaining_amount);
    }

    // Calculate remaining amount based on previous remaining amount
    let remainingAmount = previousRemainingAmount;
    if (type === 'expense') {
      remainingAmount -= parseFloat(amount);
    } else {
      remainingAmount += parseFloat(amount);
    }

    // Insert the new transaction into the database
    const insertQuery = 'INSERT INTO transactions (date, type, amount, remaining_amount) VALUES (?, ?, ?, ?)';
    connection.query(insertQuery, [date, type, amount, remainingAmount], (err, result) => {
      if (err) {
        res.status(500).send('Error adding transaction');
        return;
      }
      
      res.send('Transaction added successfully');
    });
  });
});

server.listen(port)
