let books;
let canvas_width, canvas_height, padding_width, padding_height, bookshelf_width, gap, shelf_height;
let svg, year_buttons_container, genre_buttons_container, arrow_up, arrow_down;
let selected_genres = new Set();


// INITIALIZATION
window.onload = function () {
    // responsive dimensions
    canvas_width = window.innerWidth * 0.80;
    canvas_height = window.innerHeight * 0.80;
    padding_width = 30;
    padding_height = 60;
    bookshelf_width = canvas_width - padding_width * 2;
    gap = 2;
    shelf_height = 80;

    // new svg element
    svg = d3.select('body')
        .append('svg')
        .attr('width', canvas_width)
        .attr('height', canvas_height);

    // create years container
    d3.select('#year_buttons_container').remove(); // remove old container, if there is any
    year_buttons_container = d3.select('body')
        .append('div')
        .attr('id', 'year_buttons_container')
        .style('position', 'fixed')
        .style('bottom', '60px')
        .style('left', (padding_width * 2) + "px");

    // lateral container
    genre_nav = d3.select("body")
        .append("div")
        .attr("id", "genre_nav")
        .style("position", "absolute")
        .style("top", padding_height + (innerHeight * 0.3) + "px")
        .style("right", (padding_width * 2) + "px")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("gap", "10px");

    // up button
    arrow_up = genre_nav.append("button")
        .text("▲")
        .style("font-size", "22px")
        .style("padding", "5px 10px")
        .style("background-color", "white")
        .style("border", "0px")
        .style("cursor", "pointer");

    // create genre container
    genre_buttons_container = genre_nav.append("div")
        .append("div")
        .attr("id", "genre_buttons_container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("gap", "10px");

    // down button
    arrow_down = genre_nav.append("button")
        .text("▼")
        .style("font-size", "22px")
        .style("padding", "5px 10px")
        .style("background-color", "white")
        .style("border", "0px")
        .style("cursor", "pointer");


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
    }).then(process_data);
}


// DATA PROCESSIGN ---------------------------------------------------------------
function process_data(data) {

    // create intervals of 5 years
    function interval(year) {
        year = +year;
        const start = Math.floor(year / 5) * 5;
        const end = start + 4;
        return { start, end, label: `${start}-${end}` };
    }

    // group books by intervals
    let group_interval = d3.group(data, d => interval(d.date).label);

    // show intervals with at least 10 books
    let valid_intervals = Array.from(group_interval)
        .filter(([label, livros]) => livros.length >= 10);

    // sort years cronologically
    valid_intervals.sort((a, b) => {
        const startA = +a[0].split("-")[0];
        const startB = +b[0].split("-")[0];
        return d3.ascending(startA, startB);
    });
    // console.log(valid_intervals);

    // create year buttons
    create_year_buttons(valid_intervals);

    // by default, it shows the first interval
    draw_interval(valid_intervals[0][1]);


    // BUTTONS FOR YEAR INTERVAL ----------------------------------------------------------
    function create_year_buttons(valid_intervals) {
        // create buttons for each year interval
        year_buttons_container.selectAll('button')
            .data(valid_intervals)
            .enter()
            .append('button')
            .text(d => d[0])  // text of the button = year interval
            .style('margin-right', '-2px')
            .style('padding', '10px')
            .style('width', `${(canvas_width - padding_width) / valid_intervals.length}px`)
            .style('background-color', 'white')
            .on('click', (event, d) => {
                // clear previous charts
                svg.selectAll("*").remove();

                // call fuction to draw the selected interval
                draw_interval(d[1]);
            });
    }


    // DRAW THE YEAR INTERVAL ---------------------------------------------------------------
    function draw_interval(selected_interval) {
        // remove books with 0 rating    
        let filtered_books = selected_interval.filter(d => d.rating > 0);

        // count how many books exists by genre
        let genre_counts = d3.rollup(
            filtered_books,
            v => v.length,
            d => d.genre
        );

        // get genres with 2 or more books
        let valid_genres = Array.from(genre_counts)
            .filter(([genre, count]) => count >= 2)
            .map(([genre]) => genre);
        filtered_books = filtered_books.filter(d => valid_genres.includes(d.genre));

        let genre_colors = ["#B62123", "#ED536D", "#E47476", "#F36D14", "#FF9D52", 
        "#F3B186", "#D6A315", "#FFCB3E", "#FFDF88", "#40755E", "#B7B427",
        "#CCE193", "#334FD7", "#6579C7", "#BFD3EB", "#82419D", "#BD73C3",
        "#E4B1FF", "#FB3E96", "#FD85B3", "#FFCAD1", "#37B6E5", "#7FDCFD"];

        let color_scale = d3.scaleOrdinal()
            .domain(valid_genres)
            .range(genre_colors.slice(0, valid_genres.length));


        // create genre buttons
        create_genre_buttons(valid_genres, filtered_books, color_scale);

        // draw all the books in this interval
        draw_books(filtered_books, color_scale);
    }


    // DRAW THE GENRE BUTTONS ---------------------------------------------------------------
    function create_genre_buttons(valid_genres, filtered_books, color_scale) {

        let page_size = Math.min(6, valid_genres.length); // if there's 6/+ = 6; if there's 4 = 4
        let start_index = 0; // initial position

        function render_page() {
            genre_buttons_container.selectAll("*").remove();

            let page_genres = [];

            for (let i = 0; i < page_size; i++) {
                // circular logic
                let index = (start_index + i) % valid_genres.length;
                page_genres.push(valid_genres[index]);
            }

            genre_buttons_container.selectAll("button")
                .data(page_genres)
                .enter()
                .append("button")
                .text(d => d)
                .style("padding", "10px")
                .style('width', `${(window.innerWidth * 0.15) - padding_width}px`)
                .style("cursor", "pointer")
                .style("border", "none")
                .style("color", "black")
                .style("background-color", d => color_scale(d))
                .style("opacity", 1)
                .on("click", function (event, genre) {
                    // alternate selected genre
                    if (selected_genres.has(genre)) {
                        selected_genres.delete(genre);
                    } else {
                        selected_genres.add(genre);
                    }

                    // button feedback
                    d3.select(this).style("opacity", selected_genres.has(genre) ? 0.6 : 1);

                    // update books visibility
                    svg.selectAll("rect")
                        .style("opacity", d => {
                            return (
                                selected_genres.size === 0 ||
                                selected_genres.has(d.genre)
                            ) ? 1 : 0;   // it only shows the selected ones
                        });
                });
        }

        // ARROW EVENTS  ---------------------------------------------
        arrow_up.on("click", () => {
            start_index = (start_index - 1 + valid_genres.length) % valid_genres.length;
            render_page();
        });

        arrow_down.on("click", () => {
            start_index = (start_index + 1) % valid_genres.length;
            render_page();
        });


        // first render
        render_page();
    }


    // DRAW THE BOOKS ---------------------------------------------------------------
    function draw_books(book_data, color_scale) {
        // scale book height according to its rating
        const height_scale = d3.scaleLinear()
            .domain([1, 5])
            .range([10, 70]);

        // scale book width according to its pages
        function width_scale(pages) {
            if (pages <= 200) return 15;
            else if (pages <= 400) return 20;
            else if (pages <= 600) return 30;
            else if (pages <= 800) return 40;
            else return 50; // more than 800
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
            .attr("transform", `translate(${padding_width}, ${padding_height})`);

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

