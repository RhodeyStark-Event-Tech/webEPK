import express from 'express';

const app = express();
const port = process.env.PORT ?? 3000;

// Define a route for the home page
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
