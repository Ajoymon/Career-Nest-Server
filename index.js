const express = require('express');
const cors = require('cors')
const nodemailer = require('nodemailer');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000

// ================= NODEMAILER =================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors())

// ================= MONGODB =================

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@my-first-cluster.ofk8daf.mongodb.net/?appName=my-First-Cluster`;

// hhalimaafrin

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// ================= OTP =================

let otp;




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const db = client.db('Career_Nest_db')
    const userCollection = db.collection('users')

    // ================= USER ROUTES =================

    app.post('/users', async (req, res) => {
      const user = req.body;
      user.createdAt = new Date();

      const existUser = await userCollection.findOne({ email: user.email });

      if (existUser) {
        return res.send({ message: 'user exists' });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    // ================= SEND OTP =================
    app.post('/send-otp', async (req, res) => {
      console.log('SEND OTP API HIT');
      const { email } = req.body;
      console.log('Email received:', email);
      otp = Math.floor(100000 + Math.random() * 900000);

      console.log('Sending email...');

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'CareerNest Verification Code',
          text: `Your CareerNest verification code is: ${otp}`,
        });

        console.log('Email sent successfully');

        res.send({
          success: true,
          message: 'OTP sent successfully',
        });
      } catch (error) {
        console.error('OTP ERROR:', error);

        res.status(500).send({
          success: false,
          message: 'OTP sending failed',
        });
      }
    });

    app.post('/verify-otp', (req, res) => {
      const userOtp = req.body.otp;

      if (userOtp == otp) {
        res.send({
          success: true,
          message: 'OTP verified successfully',
        });
      } else {
        res.send({
          success: false,
          message: 'Invalid OTP',
        });
      }
    });





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Career Nest server!')
})
// 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})