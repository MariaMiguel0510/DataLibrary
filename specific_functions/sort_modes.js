export function apply_sort(books, interval_label, current_sort, original_books_order_by_interval) {
    if (current_sort === "chrono") {
        let map = new Map(original_books_order_by_interval[interval_label].map((uid, i) => [uid, i]));
        books.sort((a, b) => d3.ascending(map.get(a.uid), map.get(b.uid)));
    }
    else if (current_sort === "rating") {
        books.sort((a, b) => d3.descending(a.rating, b.rating));
    }
    else if (current_sort === "pages") {
        books.sort((a, b) => d3.descending(a.pages, b.pages));
    }
}


// CREATE BUTTONS
export function create_sort_buttons({
    container,
    padding_width,
    get_current_sort,
    set_current_sort,
    redraw_interval,
    svg
}) {

    container.selectAll("*").remove();

    let sort_modes = [
        { id: "chrono", label: "Chronologically" },
        { id: "rating", label: "Rating" },
        { id: "pages", label: "Pages" }
    ];

    // Dropdown wrapper
    let dropdown = container
        .append("div")
        .style("position", "relative")
        .style("width", `${(window.innerWidth * 0.17) - padding_width}px`);

    // Main button
    let main_button = dropdown.append("button")
        .attr("id", "sort_main_button")
        .style("padding", "10px")
        .style("font-size", `${0.9}vw`)
        .style("width", `${(window.innerWidth * 0.17) - padding_width}px`)
        .style('height', `${(window.innerHeight * 0.05)}px`)
        .style("cursor", "pointer")
        .style("border", "2px solid black")
        .style("background", "#F6F6F6")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "space-between");

    main_button.append("span")
        .attr("id", "sort_main_label")
        .text("Chronologically");

    main_button.append("span")
        .attr("id", "selection_arrow")
        .text("▼");

    // dropdown menu
    let menu = dropdown.append("div")
        .attr("id", "sort_dropdown_menu")
        .style("position", "absolute")
        .style("width", `${(window.innerWidth * 0.17) - padding_width}px`)
        .style('height', `${(window.innerHeight * 0.05)}px`)
        .style('margin-top', '-2px')
        .style("background", "grey")
        .style("display", "none")
        .style("flex-direction", "column")
        .style("z-index", 10);

    function rebuild_menu() {
        let current_sort = get_current_sort();
        menu.selectAll("*").remove();

        menu.selectAll("button")
            .data(sort_modes.filter(d => d.id !== current_sort))
            .enter()
            .append("button")
            .text(d => d.label)
            .style("padding", "10px")
            .style("font-size", `${0.9}vw`)
            .style("font-family", "Poppins, sans-serif")
            .style("width", `${(window.innerWidth * 0.17) - padding_width}px`)
            .style('height', `${(window.innerHeight * 0.05)}px`)
            .style("cursor", "pointer")
            .style("display", "flex")
            .style("align-items", "center")
            .style('margin-top', '-2px')
            .style("border", "2px solid black")
            .style("background", "#D7D7D7")
            .style("text-align", "left")
            .on("click", (event, d) => {

                // update current_sort
                set_current_sort(d.id);

                // update main button text
                main_button.select("#sort_main_label").text(d.label);

                // close dropdown
                menu.style("display", "none");

                rebuild_menu();

                // redraw interval
                svg.selectAll("*").remove();
                redraw_interval();
            });
    }

    rebuild_menu();

    main_button.on("click", () => {
        let visible = menu.style("display") === "flex";
        menu.style("display", visible ? "none" : "flex");
    });
}
