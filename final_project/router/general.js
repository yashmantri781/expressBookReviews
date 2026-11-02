const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const auth = require('./auth_users.js');

const public_users = express.Router();

// Helper functions using Promises to fetch book data asynchronously
const getBookList = () => {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject({ status: 500, message: 'Failed to retrieve books' });
    }
  });
};

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject({ status: 404, message: 'Book not found' });
    }
  });
};

const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const query = author.toLowerCase().trim();
    const result = Object.values(books).filter(
      (book) =>
        book.author.toLowerCase() === query ||
        book.author.toLowerCase().includes(query)
    );
    if (result.length > 0) {
      resolve(result);
    } else {
      reject({ status: 404, message: 'No books found by this author' });
    }
  });
};

const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const query = title.toLowerCase().trim();
    const result = Object.values(books).filter((book) =>
      book.title.toLowerCase().includes(query)
    );
    if (result.length > 0) {
      resolve(result);
    } else {
      reject({ status: 404, message: 'No books found with this title' });
    }
  });
};

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (auth.isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists'
    });
  }

  auth.users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered'
  });
});

// Task 1 & Task 10: Get all books using async/await with Promise
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await getBookList();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || 'Error fetching books'
    });
  }
});

// Task 2 & Task 11: Get book details based on ISBN using async/await with Promise
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(error.status || 404).json({
      message: error.message || 'Book not found'
    });
  }
});

// Task 3 & Task 12: Get books by author using async/await with Promise
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
    const matchedBooks = await getBooksByAuthor(author);
    return res.status(200).json(matchedBooks);
  } catch (error) {
    return res.status(error.status || 404).json({
      message: error.message || 'No books found by this author'
    });
  }
});

// Task 4 & Task 13: Get books by title using async/await with Promise
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const matchedBooks = await getBooksByTitle(title);
    return res.status(200).json(matchedBooks);
  } catch (error) {
    return res.status(error.status || 404).json({
      message: error.message || 'No books found with this title'
    });
  }
});

// Task 5: Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(books[isbn].reviews);
});

// Functions demonstrating Axios usage for fetching book data (Tasks 10-13)
const axiosFetchAllBooks = async (baseUrl = 'http://localhost:5000') => {
  try {
    const response = await axios.get(`${baseUrl}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const axiosFetchByISBN = async (isbn, baseUrl = 'http://localhost:5000') => {
  try {
    const response = await axios.get(`${baseUrl}/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const axiosFetchByAuthor = async (author, baseUrl = 'http://localhost:5000') => {
  try {
    const response = await axios.get(`${baseUrl}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const axiosFetchByTitle = async (title, baseUrl = 'http://localhost:5000') => {
  try {
    const response = await axios.get(`${baseUrl}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports.general = public_users;
module.exports.getBookList = getBookList;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
module.exports.axiosFetchAllBooks = axiosFetchAllBooks;
module.exports.axiosFetchByISBN = axiosFetchByISBN;
module.exports.axiosFetchByAuthor = axiosFetchByAuthor;
module.exports.axiosFetchByTitle = axiosFetchByTitle;
