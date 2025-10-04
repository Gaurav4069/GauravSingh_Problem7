const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: "https://gauravsingh-problem7-1.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use('/api', require('./Routes/api'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
