export function initializeBooksViz(containerSelector, csvFile) {

    let books;
    let canvas_width, canvas_height, padding_width, padding_height, bookshelf_width, gap, shelf_height;
    let svg, year_buttons_container, year_tooltip, highlight_bar, genre_buttons_container, genre_divider, books_container, books_count_label;
    let selected_genres = new Set();

    let current_interval_label = null;
    let sort_buttons_container, original_books_order;
    let current_sort = "chrono"; // default
    let latest_books_in_interval = [];
    let original_books_order_by_interval = {};

    let selection_buttons_container;

    // INITIALIZATION
    // responsive dimensions
    padding_width = window.innerWidth * 0.05;
    padding_height = window.innerHeight * 0.09;

    canvas_width = containerSelector.node().clientWidth - padding_width * 2;
    canvas_height = containerSelector.node().clientHeight - padding_height * 2;

    bookshelf_width = canvas_width - (3.3 * padding_width);
    gap = 5;
    shelf_height = 80;

    // create books container (for vertical scroll)
    d3.select('#books_container').remove();
    books_container = containerSelector
        .append("div")
        .attr("id", "books_container")
        .style("position", "relative")
        .style("width", canvas_width + "px")
        .style("height", canvas_height + "px")
        .style("overflow-y", "auto")
        .style("scrollbar-width", "none") // Firefox
        .style("-ms-overflow-style", "none"); // IE/Edge antigo

    // Remove bar in Chrome/Safari/Edge
    books_container.append("style").text(`
    #books_container::-webkit-scrollbar {
        display: none;
    }
    `);

    // create selection buttons container
    selection_buttons_container = containerSelector
        .append("div")
        .attr("id", "selection_buttons_container")
        .style("display", "flex")
        .style("position", "absolute")
        .style("top", (padding_height * 1) + "px")
        .style("right", (padding_width * 0.5) + "px")
        .style("flex-direction", "column")
        .style("gap", gap + "px");

    // create sort buttons container
    sort_buttons_container = containerSelector
        .append("div")
        .attr("id", "sort_buttons_container")
        .style("display", "flex")
        .style("position", "absolute")
        .style("top", (padding_height * 1.7) + "px")
        .style("right", (padding_width * 0.5) + "px")
        .style("flex-direction", "column")
        .style("gap", gap + "px");

    // new svg element
    svg = books_container
        .append('svg')
        .attr('width', canvas_width)
        .attr('height', canvas_height);

    // create years container
    d3.select('#year_buttons_container').remove();
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
        .style("bottom", (padding_height) + "px")
        .style("right", (padding_width * 0.5) + "px")
        .style("flex-direction", "column")
        .style("gap", gap + "px");

    // create books count label    
    books_count_label = containerSelector
        .append("div")
        .attr("id", "books_count_label")
        .style("position", "absolute")
        .style("top", (padding_height * 3.5) + "px")
        .style("right", (padding_width * 1.9) + "px")
        .style("font-size", `${0.9}vw`)
        .style("pointer-events", "none")
        .style("color", "black")
        .text(`${latest_books_in_interval.length} books`);

    // create genre diviser    
    d3.select('#genre_divider').remove();
    genre_divider = containerSelector
        .append('div')
        .attr('id', 'genre_divider')
        .style('position', 'absolute')
        .style('top', '-20px')
        .style('bottom', '0')
        .style('width', '2px')
        .style('background', 'black')
        .style('right', ((canvas_width * 0.17) + (padding_width * 0.5)) + 'px');

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
        data.forEach((d, i) => {
            d.uid = i;   // unique ID 
        });

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

        // create sort buttons
        create_sort_buttons();

        // create selection buttons
        create_selection_buttons();

        // create year buttons
        create_year_buttons(valid_intervals);

        // draw first interval by default
        draw_interval(valid_intervals[0].books, valid_intervals[0].label);


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

        // SELECTION BUTTONS FUNCTION  ----------------------------------------------------------
        function create_selection_buttons() {
            selection_buttons_container.selectAll("*").remove();

            let selection_modes = [
                { id: "genre", label: "Genre" },
                { id: "author", label: "Author" },
                { id: "language", label: "Language" }
            ];

            current_sort = "genre";

            // Dropdown wrapper
            let dropdown = selection_buttons_container
                .append("div")
                .style("position", "relative")
                .style("width", `${(window.innerWidth * 0.17) - padding_width}px`);

            // Main button
            let main_button = dropdown.append("button")
                .attr("id", "selection_main_button")
                .style("padding", "10px")
                .style("font-size", `${0.9}vw`)
                .style("width", "100%")
                .style("cursor", "pointer")
                .style("border", "2px solid black")
                .style("background", "white")
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "space-between");

            // LEFT TEXT
            main_button.append("span")
                .attr("id", "selection_main_label")
                .text("Genre");

            // RIGHT ARROW
            main_button.append("span")
                .attr("id", "selection_arrow")
                .text("▼")

            // Hidden menu
            let menu = dropdown.append("div")
                .attr("id", "selection_dropdown_menu")
                .style("position", "absolute")
                .style("top", "100%")
                .style("left", "0")
                .style("width", "100%")
                .style('margin-top', '-2px')
                .style("background", "grey")
                .style("display", "none")
                .style("flex-direction", "column")
                .style("z-index", 10);

            function rebuild_menu() {
                menu.selectAll("*").remove();

                menu.selectAll("button")
                    .data(selection_modes.filter(d => d.id !== current_sort))
                    .enter()
                    .append("button")
                    .text(d => d.label)
                    .style("padding", "10px")
                    .style("font-size", `${0.9}vw`)
                    .style("cursor", "pointer")
                    .style('margin-top', '-2px')
                    .style("border", "2px solid black")
                    .style("background", "#D7D7D7")
                    .style("text-align", "left")
                    .on("click", function (event, d) {
                        // close menu
                        menu.style("display", "none");

                        // rebuild menu with the new current_sort
                        rebuild_menu();
                    });
            }

            // Build menu for the first time
            rebuild_menu();

            // Toggle dropdown
            main_button.on("click", () => {
                let visible = menu.style("display") === "flex";
                menu.style("display", visible ? "none" : "flex");
            });
        }

        // SORT FUNCTION ----------------------------------------------------------
        function apply_sort(books, interval_label) {
            if (current_sort === "chrono") {
                let map = new Map(original_books_order_by_interval[interval_label].map((uid, i) => [uid, i]));
                books.sort((a, b) => d3.ascending(map.get(a.uid), map.get(b.uid)));
            } else if (current_sort === "rating") {
                books.sort((a, b) => d3.descending(a.rating, b.rating));
            } else if (current_sort === "pages") {
                books.sort((a, b) => d3.descending(a.pages, b.pages));
            }
        }

        // SORT BUTTONS FUNCTION --------------------------------------------------
        function create_sort_buttons() {
            sort_buttons_container.selectAll("*").remove();

            let sort_modes = [
                { id: "chrono", label: "Chronologically" },
                { id: "rating", label: "Rating" },
                { id: "pages", label: "Pages" }
            ];

            current_sort = "chrono";

            // Dropdown wrapper
            let dropdown = sort_buttons_container
                .append("div")
                .style("position", "relative")
                .style("width", `${(window.innerWidth * 0.17) - padding_width}px`);

            // Main button
            let main_button = dropdown.append("button")
                .attr("id", "sort_main_button")
                .style("padding", "10px")
                .style("font-size", `${0.9}vw`)
                .style("width", "100%")
                .style("cursor", "pointer")
                .style("border", "2px solid black")
                .style("background", "white")
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "space-between");

            // LEFT TEXT
            main_button.append("span")
                .attr("id", "sort_main_label")
                .text("Chronologically");

            // RIGHT ARROW
            main_button.append("span")
                .attr("id", "sort_arrow")
                .text("▼")

            // Hidden menu
            let menu = dropdown.append("div")
                .attr("id", "sort_dropdown_menu")
                .style("position", "absolute")
                .style("top", "100%")
                .style("left", "0")
                .style("width", "100%")
                .style('margin-top', '-2px')
                .style("background", "grey")
                .style("display", "none")
                .style("flex-direction", "column")
                .style("z-index", 10);

            function rebuild_menu() {
                menu.selectAll("*").remove();

                menu.selectAll("button")
                    .data(sort_modes.filter(d => d.id !== current_sort))
                    .enter()
                    .append("button")
                    .text(d => d.label)
                    .style("padding", "10px")
                    .style("font-size", `${0.9}vw`)
                    .style("cursor", "pointer")
                    .style('margin-top', '-2px')
                    .style("border", "2px solid black")
                    .style("background", "#D7D7D7")
                    .style("text-align", "left")
                    .on("click", function (event, d) {

                        // update current sort
                        current_sort = d.id;

                        // update text of main button
                        main_button.select("#sort_main_label").text(d.label);

                        // close menu
                        menu.style("display", "none");

                        // rebuild menu with the new current_sort
                        rebuild_menu();

                        // redraw the books
                        svg.selectAll("*").remove();
                        draw_interval(latest_books_in_interval, current_interval_label);
                    });
            }

            // Build menu for the first time
            rebuild_menu();

            // Toggle dropdown
            main_button.on("click", () => {
                let visible = menu.style("display") === "flex";
                menu.style("display", visible ? "none" : "flex");
            });
        }

        // BUTTONS FOR YEAR INTERVAL ----------------------------------------------------------
        function create_year_buttons(valid_intervals) {
            let selected_interval = null;

            // bar to show the selected interval
            highlight_bar = year_buttons_container
                .append("div")
                .attr("id", "year_highlight")
                .style("position", "absolute")
                .style("width", "6px")
                .style("height", "30px")
                .style("border", "2px solid black")
                .style("pointer-events", "none")
                .style("background", "white")
                .style("opacity", 1)
                .style("z-index", 9999)
                .style("transition", "left 0.15s, top 0.15s, opacity 0.15s");

            // interval text
            year_tooltip = containerSelector
                .append("div")
                .attr("id", "year_tooltip")
                .style("position", "absolute")
                .style("pointer-events", "none")
                .style("padding", "4px 8px")
                .style("font-size", `${0.9}vw`)
                .style("background", "none")
                .style("border", "none")
                .style("border-radius", "5px")
                .style("opacity", 1)
                .style("transition", "opacity 0.15s");

            // show tooltip above the button
            function show_interval_tooltip(button, label) {
                let rect = button.getBoundingClientRect();
                let container_rect = containerSelector.node().getBoundingClientRect();

                year_tooltip
                    .html(label)
                    .style("opacity", 1)
                    .style("left", (rect.left - container_rect.left + rect.width / 2) + "px")
                    .style("top", (rect.top - container_rect.top - 30) + "px")
                    .style("transform", "translateX(-50%)");
            }

            // calculate number of books per interval
            let interval_counts = valid_intervals.map(d => d.books.length);

            // gray scale
            let gray_scale = d3.scaleLog()
                .domain([d3.min(interval_counts), d3.max(interval_counts)])
                .range(["#D7D7D7", "#6D6D6D"]);  // light to dark

            // create buttons for each year interval
            year_buttons_container.selectAll('button')
                .data(valid_intervals)
                .enter()
                .append('button')
                .attr("class", "year-button")
                .html("&nbsp;") // button keeps its size but without text
                .style('margin-right', '-2px')
                .style("border", "2px solid black")
                .style('padding', `${canvas_width * 0.003}px`)
                .style('width', `${(canvas_width - (3.8 * padding_width)) / valid_intervals.length}px`)
                .style("background-color", d => gray_scale(d.books.length))
                .style("cursor", "pointer")
                // hover
                .on("mouseover", function (event, d) {
                    show_interval_tooltip(this, d.label);
                })
                .on("mouseout", function () {
                    if (selected_interval) {
                        show_interval_tooltip(selected_interval.button, selected_interval.label);
                    } else {
                        year_tooltip.style("opacity", 0);
                    }
                })
                .on("click", function (event, d) {
                    selected_interval = {
                        button: this,
                        label: d.label
                    };

                    // move highlight bar for selection
                    highlight_bar
                        .style("opacity", 1)
                        .style("left", (this.offsetLeft + this.offsetWidth / 2 - 4) + "px")
                        .style("top", (this.offsetTop - 3) + "px");

                    show_interval_tooltip(this, d.label); // permanent tooltip in the selected area
                    svg.selectAll("*").remove(); // clear previous charts
                    draw_interval(d.books, d.label); // draw selected interval
                    d3.select("#books_count_label") // update total books label
                        .text(`${d.books.length} books`);
                });

            // positioning the first position for the highlight_bar & tooltip
            let first_button = year_buttons_container.select("button").node();
            let first_interval = valid_intervals[0];

            selected_interval = {
                button: first_button,
                label: first_interval.label
            };

            highlight_bar
                .style("left", (first_button.offsetLeft + first_button.offsetWidth / 2 - 4) + "px")
                .style("top", (first_button.offsetTop - 3) + "px");

            show_interval_tooltip(first_button, first_interval.label);
        }

        // UPDATE BOOKS COUNT
        function update_visible_books_count() {
            let visible_books;
            if (selected_genres.size === 0) {
                // Nenhum filtro selecionado → todos os livros do intervalo
                visible_books = latest_books_in_interval;
            } else {
                // Apenas os livros cujo género está selecionado
                visible_books = latest_books_in_interval.filter(d => selected_genres.has(d.genre));
            }

            // Atualiza o texto
            d3.select("#books_count_label")
                .text(`${visible_books.length} books`);
        }



        // DRAW THE YEAR INTERVAL ---------------------------------------------------------------
        function draw_interval(selected_books, interval_label) {
            current_interval_label = interval_label;

            // keep orginial order for the interval
            if (!original_books_order_by_interval[interval_label]) {
                original_books_order_by_interval[interval_label] = selected_books.map(d => d.uid);
            }

            // keep books of the current interval for sorting
            latest_books_in_interval = [...selected_books];

            // update total of books
            update_visible_books_count();

            // apply current sort
            apply_sort(latest_books_in_interval, interval_label);

            // create genre buttons
            create_genre_buttons(all_genres, latest_books_in_interval, global_color_scale);

            // draw sorted books
            draw_books(latest_books_in_interval, global_color_scale);
        }


        // CREATE THE GENRE BUTTONS ---------------------------------------------------------------
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
                .style("font-size", `${0.9}vw`)
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "flex-start")
                .style("text-align", "left")
                .style("padding-left", "15px")
                .style("cursor", d => genres_present.has(d) ? "pointer" : "default")
                .style("border", d => `5px solid ${color_scale(d)}`)
                .style("color", "black")
                .style("opacity", d => genres_present.has(d) ? 1 : 0.5)
                .style("pointer-events", d => genres_present.has(d) ? "auto" : "none")
                .style('width', `${(window.innerWidth * 0.17) - padding_width}px`)
                .style('height', `${(window.innerHeight * 0.05)}px`)
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

                    update_visible_books_count();    
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
            let current_x = padding_width * 2;
            let current_y = padding_height * 1.3;

            book_data.forEach(d => {
                let w = width_scale(d.pages);

                // if over the limit, break the line.
                if (current_x + w > padding_width + bookshelf_width) {
                    current_x = padding_width * 2;
                    current_y += shelf_height;
                }

                x_positions.push(current_x);
                y_positions.push(current_y);

                current_x += w + gap;
            });

            let shelf_width = document.getElementById("year_buttons_container").offsetWidth;
            let shelves_for_canvas = Math.ceil(canvas_height / shelf_height); // how many shelves needed to fill the canvas
            let shelves_for_books = Math.ceil((current_y - padding_height + shelf_height) / shelf_height); // how many shelves needed for the existing books
            let total_shelves = Math.max(shelves_for_canvas, shelves_for_books); // total number = the bigger one

            let shelf_levels = [];
            for (let i = 0; i < total_shelves; i++) {
                shelf_levels.push(padding_height * 1.3 + (i * shelf_height));
            }

            // adjust SVG height dinamically
            let needed_height = current_y + shelf_height + padding_height;
            svg.attr("height", Math.max(canvas_height, needed_height));

            let book_group = svg.append("g");

            book_group.selectAll('rect')
                .data(book_data)
                .enter()
                .append('rect')
                .attr('x', (d, i) => x_positions[i])
                .attr('y', (d, i) => y_positions[i] - height_scale(Math.floor(d.rating)))
                .attr('width', d => width_scale(d.pages))
                .attr('height', d => height_scale(Math.floor(d.rating)))
                .attr('fill', d => color_scale(d.genre));

            // DRAW SHELVES -------------------------------------------------------
            svg.append("g")
                .attr("id", "shelves_group")
                .selectAll("line")
                .data(shelf_levels)
                .enter()
                .append("line")
                .attr("x1", padding_width * 2 - 3)
                .attr("x2", padding_width * 2 + shelf_width)
                .attr("y1", d => d)
                .attr("y2", d => d)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
        }
    }
}
