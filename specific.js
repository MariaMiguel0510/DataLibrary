import { create_genre_buttons } from "./specific_functions/create_genre_buttons.js";
import { draw_books } from "./specific_functions/draw_books.js";
import { apply_sort, create_sort_buttons } from "./specific_functions/sort_modes.js";
import { create_selection_buttons } from "./specific_functions/selection_modes.js";

export function initializeBooksViz(containerSelector, spine_width, border, csvFile) {

    let books;
    let canvas_width, canvas_height, padding_width, padding_height, bookshelf_width, gap, shelf_height;
    let svg, year_buttons_container, year_tooltip, highlight_bar, genre_buttons_container, genre_divider, books_container, books_count_label, book_tooltip, selection_buttons_container, scrollbar_container, thumb;
    let selected_genres = new Set();
    let full_dataset;//conjunto de todos os dados

    let current_interval_label = null;
    let sort_buttons_container;
    let current_selection = "genre"; // default
    let current_sort = "chrono"; // default
    let latest_books_in_interval = [];
    let original_books_order_by_interval = {};


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
        .style("overflow-x", "hidden")
        .style("overflow-y", "auto")
        .style("scrollbar-width", "none") // Firefox
        .style("-ms-overflow-style", "none"); // IE/Edge antigo

    // Remove bar in Chrome/Safari/Edge
    books_container.append("style").text(`
    #books_container::-webkit-scrollbar {
        display: none;
    }`);

    // create scrollbar container
    scrollbar_container = containerSelector
        .append("div")
        .attr("id", "custom_scrollbar")
        .style("position", "absolute")
        .style("top", padding_height - padding_height * 0.3 + "px")
        .style("right", (padding_width * 4) + "px")
        .style("width", "4px")
        .style("height", canvas_height - padding_height * 0.67 + "px")
        .style("background", "#D7D7D7");

    // scroll bar    
    thumb = scrollbar_container
        .append("div")
        .style("width", "100%")
        .style("height", "50px") // tamanho inicial, vai atualizar depois
        .style("background", "black") // cor da barra
        .style("position", "relative");

    books_container.on("scroll", function () {
        let scroll_top = books_container.node().scrollTop;
        let scroll_height = books_container.node().scrollHeight - books_container.node().clientHeight;
        let thumb_height = parseFloat(thumb.style("height")); // height do thumb
        let max_top = scrollbar_container.node().clientHeight - thumb_height;
        thumb.style("top", (scroll_top / scroll_height * max_top) + "px");
    });

    // update scrollbar's visibility
    function update_scrollbar_visibility() {
        let real_height = parseFloat(books_container.node().dataset.realHeight);
        let container_height = books_container.node().clientHeight;

        if (real_height > container_height) {
            scrollbar_container.style("display", "block");
        } else {
            scrollbar_container.style("display", "none");
        }
    }

    // create selection buttons container
    selection_buttons_container = containerSelector
        .append("div")
        .attr("id", "selection_buttons_container")
        .style("display", "flex")
        .style("position", "absolute")
        .style("top", `${canvas_height * 0.1}px`)
        .style("right", (padding_width * 0.5) + "px")
        .style('width', `${(window.innerWidth * 0.17) - padding_width}px`)
        .style('height', `${(window.innerHeight * 0.05)}px`)
        .style("flex-direction", "column")
        .style("gap", gap + "px");

    // create sort buttons container
    sort_buttons_container = containerSelector
        .append("div")
        .attr("id", "sort_buttons_container")
        .style("display", "flex")
        .style("position", "absolute")
        .style("bottom", (padding_height * 9) + "px")
        .style("right", (padding_width * 0.5) + "px")
        .style('width', `${(window.innerWidth * 0.17) - padding_width}px`)
        .style('height', `${(window.innerHeight * 0.05)}px`)
        .style("flex-direction", "column")
        .style("gap", gap + "px");

    // new svg element
    svg = books_container
        .append('svg')
        .attr('width', canvas_width)
        .attr('height', canvas_height);

    // tooltip for books
    book_tooltip = containerSelector
        .append("div")
        .attr("id", "book_tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("padding", "6px 10px")
        .style("font-size", `${0.9}vw`)
        .style("font-family", "Poppins, sans-serif")
        .style("background", "white")
        .style("border", "2px solid black")
        .style("opacity", 0)
        .style("z-index", 99999);

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
    genre_buttons_container
        .append("div")
        .attr("id", "books_count_label")
        .style("font-size", `${0.9}vw`)
        .style("pointer-events", "none")
        .style("color", "black")
        .style("margin-bottom", gap * 2 + "px")
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
            genre: d.Genre,
            isbn: d['isbn-13']
        }
    }).then(process_data);



    // DATA PROCESSIGN ---------------------------------------------------------------
    function process_data(data) {
        full_dataset = data;//keeps the full data set

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
        create_sort_buttons({
            container: sort_buttons_container,
            padding_width,
            get_current_sort: () => current_sort,
            set_current_sort: (value) => current_sort = value,
            redraw_interval: () => draw_interval(latest_books_in_interval, current_interval_label, current_sort),
            svg
        });

        // create selection buttons
        create_selection_buttons({
            container: selection_buttons_container,
            padding_width,
            get_current_selection: () => current_selection
        });

        // create year buttons
        create_year_buttons(valid_intervals);

        // draw first interval by default
        draw_interval(valid_intervals[0].books, valid_intervals[0].label, current_sort);

        //FUNÇÃO PARA ATUALIZAR INTERVALO DE ANO
        function select_interval_by_year(newYear, previousYear) {

            //determina o intervalo do livro atualmente em close-up
            let intervalCurrent = valid_intervals.find(d => {
                let [start, end] = d.label.split("-").map(Number);
                return previousYear >= start && previousYear <= end;
            });

            //determina o intervalo para o duplicate selecionado
            let intervalTarget = valid_intervals.find(d => {
                let [start, end] = d.label.split("-").map(Number);
                return newYear >= start && newYear <= end;
            });

            //se for o MESMO intervalo, não reseta a estante
            if (intervalCurrent === intervalTarget) {
                return; //mantém fundo + filtros + estante intactos
            }

            //intervalo diferente reseta a timeline 
            selected_genres.clear(); //limpa géneros ao mudar de intervalo

            svg.selectAll("*").remove();  //limpa estante atual
            draw_interval(intervalTarget.books); //desenha a nova estante

            //atualiza posição da highlight bar nos botões
            let buttons = year_buttons_container.selectAll("button").nodes();
            let index = valid_intervals.indexOf(intervalTarget);

            if (index >= 0) {
                let btn = buttons[index];
                highlight_bar
                    .style("opacity", 1)
                    .style("left", (btn.offsetLeft + btn.offsetWidth / 2 - 3) + "px")
                    .style("top", (btn.offsetTop - 2) + "px");
            }
        }


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
                .style("z-index", 2)
                .style("transition", "left 0.15s, top 0.15s, opacity 0.15s");

            // interval text
            year_tooltip = containerSelector
                .append("div")
                .attr("id", "year_tooltip")
                .style("position", "absolute")
                .style("pointer-events", "none")
                .style("padding", "4px 8px")
                .style("font-size", `${0.9}vw`)
                .style("font-family", "Poppins, sans-serif")
                .style("background", "none")
                .style("border", "none")
                .style("opacity", 1)
                .style("transition", "opacity 0.15s");

            // show tooltip above the button
            function show_year_tooltip(button, label) {
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
                    show_year_tooltip(this, d.label);
                })
                .on("mouseout", function () {
                    if (selected_interval) {
                        show_year_tooltip(selected_interval.button, selected_interval.label);
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

                    show_year_tooltip(this, d.label); // permanent tooltip in the selected area
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

            show_year_tooltip(first_button, first_interval.label);
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
        function draw_interval(selected_books, interval_label, current_sort = "chrono") {
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
            apply_sort(
                latest_books_in_interval,
                interval_label,
                current_sort,
                original_books_order_by_interval
            );

            // create genre buttons
            create_genre_buttons(
                genre_buttons_container,
                all_genres,
                latest_books_in_interval,
                global_color_scale,
                selected_genres,
                update_visible_books_count,
                genre_stroke_colors,
                window,
                padding_width,
                svg
            );

            // draw sorted books
            draw_books(
                svg,
                latest_books_in_interval,
                global_color_scale,
                padding_width,
                padding_height,
                bookshelf_width,
                shelf_height,
                canvas_height,
                books_container,
                gap,
                containerSelector,
                spine_width,
                border,
                full_dataset,
                select_interval_by_year,
                book_tooltip
            );

            selected_genres.clear();
        }
    }
}
