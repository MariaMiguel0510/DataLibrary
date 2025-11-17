let books;

window.onload = function() {
    books = "livros_dados.csv";

    d3.csv(filmes, d => {
        return {
            name: +d.Name,
            author: +d.Author,
            date: +d.Publication_date, // make this entry a number
            rating: d.av_Rating,
            lang: d.Language,
            pages: d.Pages,
            publisher: d.Publisher,
            genre: d.Genre
        }
    }).then(smallMultiples);
}