let books;

window.onload = function() {
    books = "livros_dados.csv";

    d3.csv(books, d => {
        return {
            name: d.Name,
            author: d.Author,
            date: +d.Publication_date.slice(0, 4), // make this entry a number
            rating: +d.av_Rating,
            lang: d.Language,
            pages: +d.Pages,
            publisher: d.Publisher,
            genre: d.Genre
        }
    }).then(smallMultiples);
}


function smallMultiples (data) {

    // groups the data by year
    // transforms the year in a interval “X to Y”
    function interval(year) {
        year = +year;
        const start = Math.floor(year / 5) * 5;
        const end = start + 5;      // fim inclusivo
        return `${start} a ${end}`;
    }

    // group the years in intervals
    let data_year = d3.group(data, d => interval(d.date));
    let my_data = [];

    //console.log(data_year);
    
    // for each interval of 5 years:
    // genre
    data_year.forEach((d, year) => {
        const by_genre = d3.group(d, t => t.genre); // groups data items by year
        let genre_data = [];

        // Para cada género dentro do intervalo…
        by_genre.forEach((booksInGenre, genreName) => {

            genre_data.push({
                genre: genreName,
                books: booksInGenre.map(b => ({
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

        // Estrutura final organizada por intervalo
        my_data.push({
            interval: year,
            genres: genre_data
        });

        /* sort by year
        sub_data.sort((a, b) => {
            return d3.descending(a.year, b.year);
        });

        my_data.push(sub_data); */
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