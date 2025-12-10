import { create_genre_buttons } from "./specific_functions/genre_buttons.js";
import { create_year_buttons } from "./specific_functions/year_buttons.js";
import { draw_books } from "./specific_functions/draw_books.js";
import { apply_sort, create_sort_buttons } from "./specific_functions/sort_modes.js";
import { create_selection_buttons } from "./specific_functions/selection_modes.js";

export function initializeBooksViz(container_selector, spine_width, border, csvFile) {

    let books;
    let canvas_width, canvas_height, padding_width, padding_height, bookshelf_width, gap, shelf_height;
    let svg, year_buttons_container, year_tooltip, highlight_bar, genre_buttons_container, genre_divider, books_container, books_count_label, book_tooltip, selection_buttons_container, scrollbar_container, thumb;
    let yearElements = {};//armazena tooltip e highlight_bar 
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

    //window dimensions
    canvas_width = container_selector.node().clientWidth - padding_width * 2;
    canvas_height = container_selector.node().clientHeight - padding_height * 2;

    bookshelf_width = canvas_width - (3.3 * padding_width);
    gap = 5;
    shelf_height = 80;

    //create books container (for vertical scroll)
    d3.select('#books_container').remove();
    books_container = contentores(container_selector, 'div', 'books_container', 'relative', null, null, null, null, false, canvas_width + "px", canvas_height + "px", null, false, 'default');
    books_container.style("overflow-x", "hidden")
        .style("overflow-y", "auto")
        .style("scrollbar-width", "none") // Firefox
        .style("-ms-overflow-style", "none")// IE/Edge antigo
        .append("style").text(`#books_container::-webkit-scrollbar {display: none;}`);

    //create scrollbar container
    scrollbar_container = contentores(container_selector, 'div', 'custom_scrollbar', 'absolute', padding_height - padding_height * 0.3 + "px", null, (padding_width * 4) + "px", null, false, '4px', canvas_height - padding_height * 0.67 + "px", '#D7D7D7', false, 'default');

    //scroll bar    
    thumb = contentores(scrollbar_container, 'div', null, 'relative', null, null, null, null, false, '100%', '50px', 'black', false, 'default');
    books_container.on("scroll", function () {
        let scroll_top = books_container.node().scrollTop;
        let scroll_height = books_container.node().scrollHeight - books_container.node().clientHeight;
        let thumb_height = parseFloat(thumb.style("height")); // height do thumb
        let max_top = scrollbar_container.node().clientHeight - thumb_height;
        thumb.style("top", (scroll_top / scroll_height * max_top) + "px");
    });

    //create selection buttons container
    selection_buttons_container = contentores(container_selector, 'div', 'selection_buttons_container', 'absolute', `${canvas_height * 0.1}px`, null, (padding_width * 0.5) + "px", null, true, `${(window.innerWidth * 0.17) - padding_width}px`, `${(window.innerHeight * 0.05)}px`, null, false, 'default');

    // create sort buttons container
    sort_buttons_container = contentores(container_selector, 'div', 'sort_buttons_container', 'absolute', null, (padding_height * 9) + "px", (padding_width * 0.5) + "px", null, true, `${(window.innerWidth * 0.17) - padding_width}px`, `${(window.innerHeight * 0.05)}px`, null, false, 'default');

    //new svg element
    svg = books_container
        .append('svg')
        .attr('width', canvas_width)
        .attr('height', canvas_height);

    //tooltip for books
    book_tooltip = contentores(container_selector, 'div', 'book_tooltip', 'absolute', null, null, null, null, false, 'auto', 'auto', 'white', true, 'auto');
    book_tooltip.style("padding", "6px 10px")
        .style("border", "2px solid black")
        .style("opacity", 0)
        .style("z-index", 99999);

    //create years container
    d3.select('#year_buttons_container').remove();
    year_buttons_container = contentores(container_selector, 'div', 'year_buttons_container', 'absolute', null, (padding_height) + "px", null, (padding_width * 2) + "px", false, 'auto', 'auto', null, false, 'default');

    //create genre container
    genre_buttons_container = contentores(container_selector, 'div', 'genre_buttons_container', 'absolute', null, (padding_height) + "px", (padding_width * 0.5) + "px", null, true, null, null, null, false, 'default')

    // create books count label
    contentores(genre_buttons_container, 'div', 'books_count_label', null, null, null, null, null, false, null, null, 'black', true, 'auto')
    genre_buttons_container
        .style("pointer-events", "none")
        .style("margin-bottom", gap * 2 + "px")
        .text(`${latest_books_in_interval.length} books`);

    // create genre diviser    
    d3.select('#genre_divider').remove();
    genre_divider = contentores(container_selector, 'div', 'genre_divider', 'absolute', '-20px', '0', ((canvas_width * 0.17) + (padding_width * 0.5)) + 'px', null, false, '2px', 'auto', 'black', false, 'default')

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


    //CONTAINERS CREATION FUCNTION ----------------------------------------------------------------------------------------------------------------
    function contentores(place, format, nome, pos, top, bottom, drt, esq, display, larg, alt, cor, fonte, cursor) {
        let elem = place.append(format)

        elem.attr('id', nome)
            .style('position', pos)
            .style('top', top)
            .style('bottom', bottom)
            .style('right', drt)
            .style('left', esq)
            .style('width', larg)
            .style('height', alt)
            .style('background-color', cor)
            .style('cursor', cursor);

        if (display == true) {
            elem.style('display', 'flex')
                .style('flex-direction', 'column')
                .style("gap", gap + "px");
        }

        if (fonte == true) {
            elem.style('font-family', "Poppins, sans-serif")
                .style("font-size", `${0.9}vw`);
        }

        return elem
    }

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
        create_sort_buttons({ container: sort_buttons_container, padding_width, get_current_sort: () => current_sort, set_current_sort: (value) => current_sort = value,
            redraw_interval: () => draw_interval(latest_books_in_interval, current_interval_label, current_sort), svg });

        // create selection buttons
        create_selection_buttons({ container: selection_buttons_container, padding_width, get_current_selection: () => current_selection });

        // create year buttons
        create_year_buttons( valid_intervals, highlight_bar, year_buttons_container, year_tooltip, container_selector, draw_interval, canvas_width, padding_width, svg, yearElements );

        // draw first interval by default
        draw_interval(valid_intervals[0].books, valid_intervals[0].label, current_sort);

        // FUNCTION TO UPDATE YEAR INTERVAL 
        function select_interval_by_year(newYear, previousYear) {

            // determines the interval of the book currently in close-up
            let intervalCurrent = valid_intervals.find(d => {
                let [start, end] = d.label.split("-").map(Number);
                return previousYear >= start && previousYear <= end;
            });

            // determines the interval of the duplicate book
            let intervalTarget = valid_intervals.find(d => {
                let [start, end] = d.label.split("-").map(Number);
                return newYear >= start && newYear <= end;
            });

            // if its the SAME interval, doesnt reset the shelf
            if (intervalCurrent === intervalTarget) {
                return; // keeps background + filters + shelf intact
            }

            // different intervals resets the timeline 
            selected_genres.clear(); // clean genres

            svg.selectAll("*").remove();  // clean current shelf
            draw_interval(intervalTarget.books); // draw new shelf

            // update the highlight bar position
            let buttons = year_buttons_container.selectAll("button").nodes();
            let index = valid_intervals.indexOf(intervalTarget);

            if (index >= 0) {
                let btn = buttons[index];
                yearElements.highlight_bar
                    .style("opacity", 1)
                    .style("left", (btn.offsetLeft + btn.offsetWidth / 2 - 3) + "px")
                    .style("top", (btn.offsetTop - 2) + "px");
                //atualiza o label de anos sempre o intervalo muda
                yearElements.show_year_tooltip(btn, intervalTarget.label);

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
            apply_sort(latest_books_in_interval, interval_label, current_sort, original_books_order_by_interval);

            // create genre buttons
            create_genre_buttons( genre_buttons_container, all_genres, latest_books_in_interval, global_color_scale, selected_genres, update_visible_books_count, genre_stroke_colors, window, padding_width, svg, yearElements);

            // draw sorted books
            draw_books( svg, latest_books_in_interval, selected_genres, global_color_scale, padding_width, padding_height, bookshelf_width, shelf_height, canvas_height, 
                books_container, scrollbar_container, gap, container_selector, spine_width, border, full_dataset, select_interval_by_year, book_tooltip );

            selected_genres.clear();
        }
    }
}
