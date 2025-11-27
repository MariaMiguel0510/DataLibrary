export function initializeBooksViz(containerSelector, csvFile) {

    let books;
    let canvas_width, canvas_height, padding_width, padding_height, bookshelf_width, gap, shelf_height;
    let svg, year_buttons_container, genre_buttons_container;
    let selected_genres = new Set();


    // INITIALIZATION
    // responsive dimensions
    padding_width = window.innerWidth * 0.05;
    padding_height = window.innerHeight * 0.07;

    canvas_width = containerSelector.node().clientWidth - padding_width * 2;
    canvas_height = containerSelector.node().clientHeight - padding_height * 2;

    bookshelf_width = canvas_width - padding_width * 5;
    gap = 2;
    shelf_height = 80;

    // new svg element
    svg = containerSelector
        .append('svg')
        .attr('width', canvas_width)
        .attr('height', canvas_height);

    // create years container
    d3.select('#year_buttons_container').remove(); // remove old container, if there is any
    year_buttons_container = containerSelector
        .append('div')
        .attr('id', 'year_buttons_container')
        .style('position', 'absolute')
        .style('bottom', (padding_height) + "px")
        .style('left', (padding_width * 2) + "px");

    // create genre container
    genre_buttons_container = containerSelector
        .append("div")
        .attr("id", "genre_buttons_container")
        .style("display", "flex")
        .style("position", "absolute")
        .style("bottom", (padding_height * 2) + "px")
        .style("right", (padding_width * 0.5) + "px")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("gap", "10px");

    books = csvFile;

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
    }).then(process_data);



    // DATA PROCESSIGN ---------------------------------------------------------------
    function process_data(data) {
        // get all the possible genres
        let all_genres = Array.from(new Set(data.map(d => d.genre))).sort();

        let genre_colors = {
            "Suspense": "#F44D27", "Children's Literature": "#FFE365",
            "Dramatic Literature": "#A8376D", "Comics": "#468168",
            "Sciences": "#FF9D52", "Fantasy": "#A3CCFF",
            "Fiction": "#C688CB", "Lifestyle": "#4763E8",
            "Nonfiction": "#C5E661", "Romance": "#FF589D"
        };

        let genre_stroke_colors = {
            "Suspense": "#972C14", "Children's Literature": "#9F8924",
            "Dramatic Literature": "#53072C", "Comics": "#12412D",
            "Sciences": "#AF5D1F", "Fantasy": "#3A5D89",
            "Fiction": "#844189", "Lifestyle": "#14267E",
            "Nonfiction": "#647B20", "Romance": "#A71B55"
        };

        let global_color_scale = d3.scaleOrdinal()
            .domain(all_genres)
            .range(all_genres.map(g => genre_colors[g]));

        let global_genre_counts = d3.rollup(data, v => v.length, d => d.genre);

        let valid_global_genres = Array.from(global_genre_counts)
            .filter(([g, count]) => count >= 5)
            .map(([g]) => g);

        // create intervals of 2 years
        function interval(year) {
            year = +year;
            const start = Math.floor(year / 2) * 2;
            const end = start + 1;
            return `${start}-${end}`;
        }

        // group books into intervals
        let group_interval = d3.group(data, d => interval(d.date));

        // convert to array
        let all_intervals = Array.from(group_interval);

        // FINAL FILTER: only intervals with >=10 books AFTER all internal filters
        let valid_intervals = all_intervals
            .map(([label, books]) => {
                return {
                    label,
                    books: filter_books_inside_interval(books)
                };
            })
            .filter(d => d.books.length >= 10);

        // sort by year
        valid_intervals.sort((a, b) => {
            const startA = +a.label.split("-")[0];
            const startB = +b.label.split("-")[0];
            return d3.ascending(startA, startB);
        });

        // create year buttons
        create_year_buttons(valid_intervals);

        // draw first interval by default
        draw_interval(valid_intervals[0].books);


        // FILTER BOOKS INSIDE THE INTERVAL ----------------------------------------------------------
        function filter_books_inside_interval(interval_books) {

            // remove rating 0
            let filtered = interval_books.filter(d => d.rating > 0);

            // count genres
            let genre_counts = d3.rollup(filtered, v => v.length, d => d.genre);

            // keep only genres with >=5 books
            let valid_genres = Array.from(genre_counts)
                .filter(([g, count]) => count >= 5)
                .map(([g]) => g);

            return filtered.filter(d => valid_genres.includes(d.genre));
        }

        // BUTTONS FOR YEAR INTERVAL ----------------------------------------------------------
        function create_year_buttons(valid_intervals) {
            // create buttons for each year interval
            year_buttons_container.selectAll('button')
                .data(valid_intervals)
                .enter()
                .append('button')
                .text(d => d.label)  // text of the button = year interval
                .style("font-size", "11px")
                .style('margin-right', '-2px')
                .style('padding', '10px')
                .style('width', `${(canvas_width - (4.3 * padding_width)) / valid_intervals.length}px`)
                .style('background-color', 'white')
                .on('click', (event, d) => {
                    // clear previous charts
                    svg.selectAll("*").remove();

                    // call fuction to draw the selected interval
                    draw_interval(d.books);
                });
        }


        // DRAW THE YEAR INTERVAL ---------------------------------------------------------------
        function draw_interval(selected_books) {
            // create genre buttons
            create_genre_buttons(valid_global_genres, selected_books, global_color_scale);

            // draw books
            draw_books(selected_books, global_color_scale);
        }


        // DRAW THE GENRE BUTTONS ---------------------------------------------------------------
        function create_genre_buttons(valid_genres, filtered_books, color_scale) {
            genre_buttons_container.selectAll("*").remove();

            // Set dos géneros presentes no intervalo
            let genres_present = new Set(filtered_books.map(d => d.genre));

            genre_buttons_container.selectAll("button")
                .data(valid_genres)
                .enter()
                .append("button")
                .text(d => d)
                .style("padding", "10px")
                .style("margin-right", "8px")
                .style("cursor", d => genres_present.has(d) ? "pointer" : "default")
                .style("border", d => `5px solid ${color_scale(d)}`)
                .style("color", "black")
                .style("opacity", d => genres_present.has(d) ? 1 : 0.5)
                .style("pointer-events", d => genres_present.has(d) ? "auto" : "none")
                .style('width', `${(window.innerWidth * 0.15) - padding_width}px`)
                .style("background-color", d => color_scale(d))
                .style("box-sizing", "border-box")
                .on("click", function (event, genre) {
                    if (!genres_present.has(genre)) return;

                    if (selected_genres.has(genre)) {
                        selected_genres.delete(genre);
                        d3.select(this).style("border", `5px solid ${color_scale(genre)}`);
                    } else {
                        selected_genres.add(genre);
                        d3.select(this).style("border", `5px solid ${genre_stroke_colors[genre]}`);
                    }

                    svg.selectAll("rect")
                        .style("opacity", d => selected_genres.size === 0 || selected_genres.has(d.genre) ? 1 : 0);
                });
        }


        // DRAW THE BOOKS ---------------------------------------------------------------
        function draw_books(book_data, color_scale) {
            // scale book height according to its rating
            const height_scale = d3.scaleLinear()
                .domain([1, 5])
                .range([8, 60]);

            // scale book width according to its pages
            function width_scale(pages) {
                if (pages <= 200) return 12;
                else if (pages <= 400) return 17;
                else if (pages <= 600) return 22;
                else if (pages <= 800) return 27;
                else return 32; // more than 800
            }

            // calculate positions
            let x_positions = [];
            let y_positions = [];
            let current_x = padding_width;
            let current_y = padding_height;

            book_data.forEach(d => {
                let w = width_scale(d.pages);

                // if over the limit, break the line.
                if (current_x + w > padding_width + bookshelf_width) {
                    current_x = padding_width;
                    current_y += shelf_height;
                }

                x_positions.push(current_x);
                y_positions.push(current_y);

                current_x += w + 5;
            });

            let book_group = svg.append("g")
                .attr("transform", `translate(${padding_width}, 0)`);

            book_group.selectAll('rect')
                .data(book_data.map((d, i) => ({ ...d, id: i })))
                .enter()
                .append('rect')
                .attr('x', (d, i) => x_positions[i])
                .attr('y', (d, i) => y_positions[i] - height_scale(Math.floor(d.rating)))
                .attr('width', d => width_scale(d.pages))
                .attr('height', d => height_scale(Math.floor(d.rating)))
                .attr('fill', d => color_scale(d.genre));
        }
    }
}
