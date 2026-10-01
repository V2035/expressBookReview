const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "express-book-review-secret";

app.use(express.json());

const users = {};

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.get("/", (req, res) => res.json(books));

app.get("/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

app.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.values(books).filter(
    book => book.author.toLowerCase() === author
  );
  res.json(result);
});

app.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.values(books).filter(
    book => book.title.toLowerCase() === title
  );
  res.json(result);
});

app.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book.reviews);
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users[username]) {
    return res.status(409).json({ message: "User already exists" });
  }
  users[username] = { username, password };
  res.status(201).json({ message: "User successfully registered" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

app.put("/review/:isbn", authenticate, (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const review = req.body.review || req.body.comment;
  if (!review) return res.status(400).json({ message: "Review is required" });

  book.reviews[req.user.username] = review;
  res.json({
    message: "Review successfully added/updated",
    reviews: book.reviews
  });
});

app.delete("/review/:isbn", authenticate, (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  delete book.reviews[req.user.username];
  res.json({
    message: "Review successfully deleted",
    reviews: book.reviews
  });
});

app.listen(PORT, () => {
  console.log("Express Book Review server running on port " + PORT);
});

module.exports = app;
