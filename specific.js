let books;

window.onload = function() {
    books = "livros_dados.csv";

    d3.csv(books, d => {
        return {
            name: d.Name,
            author: d.Author,
            date: +d.Publication_date.slice(0, 4), 
            rating: +d.av_Rating,
            lang: d.Language,
            pages: +d.Pages,
            publisher: d.Publisher,
            genre: d.Genre
        }
    }).then(smallMultiples);
}


function smallMultiples (data) {

    function interval(year) {
        year = +year;
        const start = Math.floor(year / 5) * 5;
        const end = start + 5;
        return `${start} a ${end}`;
    }

    // group by intervals of 5 years
    let data_year = Array.from(d3.group(data, d => interval(d.date)));

    // sort cronologically
    data_year.sort((a, b) => {
        const start_a = +a[0].split(" a ")[0];
        const start_b = +b[0].split(" a ")[0];
        return d3.ascending(start_a, start_b);
    });

    let my_data = [];

    data_year.forEach(([intervalo, livros]) => {

        // group by genre, inside the interval of years
        const by_genre = d3.group(livros, d => d.genre);

        let sub_data = [];

        by_genre.forEach((books_genre, genre) => {
            sub_data.push({
                genre: genre,
                books: books_genre.map(b => ({
                    name: b.name,
                    author: b.author,
                    publisher: b.publisher,
                    pages: b.pages,
                    rating: b.rating,
                    lang: b.lang,
                    date: b.date
                }))
            });

        });

        // final structure
        my_data.push({
            interval: intervalo,  
            genres: sub_data
        });

    });

    console.log(my_data);

/*
    console.log(my_data);

    let genres = svg.selectAll('g')
        .data(my_data)
        .join(
            enter => enter.append('g')
                .filter(d => d.length > 5) // filter data so only genres with more than 5 entries appear
                .attr('id', d => d[0].genre)
                // put in a grid of 4x4
                // (i%4) -> gives me the column index
                // Math.floor(i/4) -> gives me the row index
                .attr("transform", (d, i) => "translate(" + (radius + (radius*2)*(i%4)) + "," + (170 + 330 * Math.floor(i/4)) + ")")
                .style("text-anchor", "middle")
        );

    // title for each sub-plot
    genres
        .append('text')
        .text( d => d[0].genre)
        .attr('x', 0)
        .attr('y', -radius+20)
        .style('text-center', 'center');

    max_pop = d3.max(my_data, d => {
        console.log(d)
        return d3.max(d, t => t.avg_pop)
    });
    max_nMovies = d3.max(my_data, d => d3.max(d, t => t.n_mov));
    max_nAwards = d3.max(my_data, d => d3.max(d, t => t.awards));

    draw_yearAng(genres); */
}