import { closeup_books } from "./closeup_books.js";

export function draw_books(
    svg,
    book_data,
    selected_genres,
    color_scale,
    padding_width,
    padding_height,
    bookshelf_width,
    shelf_height,
    canvas_height,
    books_container,
    gap,
    container_selector,
    spine_width,
    border,
    full_dataset,
    select_interval_by_year,
    book_tooltip
) {
    // scale book height according to rating
    let height_scale = d3.scaleLinear()
        .domain([1, 5])
        .range([8, 60]);

    // scale book width according to pages
    function width_scale(pages) {
        if (pages <= 200) return 12;
        else if (pages <= 400) return 17;
        else if (pages <= 600) return 22;
        else if (pages <= 800) return 27;
        else return 45;
    }

    // tooltip - function to break text
    function wrap_text(text, max_chars) {
        let words = text.split(" "); // divide original text into words separated by spaces
        let lines = []; // array to keep each final line
        let current_line = "";

        words.forEach(word => {
            if ((current_line + word).length <= max_chars) { // verify if the word still fits within the current line
                current_line += word + " "; // add the word to current line
            } else {
                lines.push(current_line.trim()); // send the current line to the array
                current_line = word + " "; // start a new line with the current word
            }
        });

        // after the loop, if there's still text on the last line, add to the array
        if (current_line.length > 0) {
            lines.push(current_line.trim());
        }

        return lines.join("<br>"); // join all lines
    }

    let current_page = 0;
    let pages = [];

    function prepare_pages() {
        // filter books by genre (if none selected, use all)
        let filtered_books = selected_genres.size === 0
            ? book_data
            : book_data.filter(d => selected_genres.has(d.genre));

        // organize by shelves
        let shelf_right_limit = padding_width + bookshelf_width - padding_width * 0.1;  // calc right limite for the shelves
        let books_per_row = []; // array of row of books
        let current_row = []; // current row of books
        let current_x = padding_width * 2; // inicial x pos for the books

        // organize books by lines considering the available space
        filtered_books.forEach(d => {
            let w = width_scale(d.pages); // book's width
            if (current_x + w > shelf_right_limit) { // if the book doesnt fit in the current row
                books_per_row.push(current_row);  // add the current row to the array
                current_row = []; // start a new row
                current_x = padding_width * 2; // reset x pos
            }
            current_row.push(d); // add book to the current row 
            current_x += w + gap;
        });
        if (current_row.length > 0) books_per_row.push(current_row); // add the last line if it exists

        // calc how many shelves fit the canvas
        let max_shelves_per_page = Math.max(1, Math.floor(canvas_height / shelf_height) - 1);

        pages = [];

        // divide the shelves in pages, each page goes to the max_shelves_per_page
        for (let i = 0; i < books_per_row.length; i += max_shelves_per_page) {
            let page = books_per_row.slice(i, i + max_shelves_per_page);

            // completes the page with empty shelves till it fills the page
            while (page.length < max_shelves_per_page) page.push([]);
            pages.push(page);
        }
    }

    function render_page() {
        svg.selectAll("*").remove();  // clean the svg before drawing the current page

        let shelves = pages[current_page];
        let y = padding_height * 2;

        shelves.forEach(row => {
            let x = padding_width * 2;

            // for each book in the shelf, draw a rect to represent the book
            row.forEach(d => {
                let h = height_scale(Math.floor(d.rating)); // height according to rating
                let w = width_scale(d.pages); // width according to pages

                svg.append("rect")
                    .attr("class", "book_rect")
                    .attr("x", x)
                    .attr("y", y - h)
                    .attr("width", w)
                    .attr("height", h)
                    .attr("fill", color_scale(d.genre))
                    .style("cursor", "pointer")
                    // call the fuction to show the closeup
                    .on("click", function (event) {
                        event.stopPropagation();
                        closeup_books(container_selector, spine_width, border, d, color_scale(d.genre), full_dataset, select_interval_by_year);
                    })
                    // show the tooltip with the name of the book
                    .on("mouseover", function (event) {
                        book_tooltip
                            .style("opacity", 1)
                            .html(`${wrap_text(d.name, 30)}`);
                    })
                    // move the tooltip with the mouse
                    .on("mousemove", function (event) {
                        book_tooltip
                            .style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY - 20) + "px");
                    })
                    // hide the tooltip
                    .on("mouseout", () => book_tooltip.style("opacity", 0));

                x += w + gap;
            });

            // draw the shelf
            let shelf_width = document.getElementById("year_buttons_container").offsetWidth;
            svg.append("line")
                .attr("x1", padding_width * 2 - 3)
                .attr("x2", padding_width * 2 + shelf_width)
                .attr("y1", y)
                .attr("y2", y)
                .attr("stroke", "black")
                .attr("stroke-width", 3);

            y += shelf_height; // next shelf
        });

        update_arrows(); // update visibility/state of the nav arrows
    }

    // navegation arrows
    d3.select("#left_page_arrow").remove();
    d3.select("#right_page_arrow").remove();

    let left_arrow = container_selector
        .append("div")
        .attr("id", "left_page_arrow")
        .html("&#9664;") // arrow code
        .style("position", "absolute")
        .style("top", padding_height / 4 + "px")
        .style("left", padding_width * 2 + "px")
        .style("font-size", `${1.9}vw`)
        .style("cursor", "pointer")
        .style("user-select", "none")
        .style("opacity", 0.3)
        .on("click", () => {
            if (current_page > 0) {
                current_page--;
                render_page();
            }
        });

    let right_arrow = container_selector
        .append("div")
        .attr("id", "right_page_arrow")
        .html("&#9654;") // arrow code
        .style("position", "absolute")
        .style("top", padding_height / 4 + "px")
        .style("right", padding_width * 4.35 + "px")
        .style("font-size", `${1.9}vw`)
        .style("cursor", "pointer")
        .style("user-select", "none")
        .style("opacity", 0.3)
        .on("click", () => {
            if (current_page < pages.length - 1) {
                current_page++;
                render_page();
            }
        });

    // function to update arrow opacity
    function update_arrows() {
        left_arrow.style("opacity", current_page === 0 ? 0.1 : 0.9);
        right_arrow.style("opacity", current_page === pages.length - 1 ? 0.1 : 0.9);
    }

    // prepare inicial pages
    prepare_pages();
    render_page();

    // update when a genre is selected
    return function update_for_genres() {
        current_page = 0; // goes back to the 1st page
        prepare_pages(); // rebuilds the pages with the updated filter
        render_page(); // redraws
    };
}
