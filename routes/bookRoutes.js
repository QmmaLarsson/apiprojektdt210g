const express = require("express");
const router = express.Router();
const Review = require("../models/review");

//Hämta bok och recensioner
router.get("/book/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        //Hämta recensioner
        const reviews = await Review.find({ bookId }).populate("user", "username email");

        //Hämta böcker från Google Books API
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        if (!response.ok) {
            return res.status(404).json({ error: "Boken hittades inte" });
        }
        const book = await response.json();

        res.json({
            book: {
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors || [],
                description: book.volumeInfo.description || "",
                thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
                publishedDate: book.volumeInfo.publishedDate || "",
                googleBookId: book.id
            },
            reviews
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;