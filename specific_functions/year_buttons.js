export function create_year_buttons(
    valid_intervals,
    highlight_bar,
    year_buttons_container,
    year_tooltip,
    container_selector,
    draw_interval,
    canvas_width,
    padding_width,
    svg,
    elements
) {
    let selected_interval = null;

    // bar to show the selected interval
    elements.highlight_bar = year_buttons_container
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
    elements.year_tooltip = container_selector
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
        let container_rect = container_selector.node().getBoundingClientRect();

        elements.year_tooltip
            .html(label)
            .style("opacity", 1)
            .style("left", (rect.left - container_rect.left + rect.width / 2) + "px")
            .style("top", (rect.top - container_rect.top - 30) + "px")
            .style("transform", "translateX(-50%)");
    }
    elements.show_year_tooltip = show_year_tooltip;


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
                elements.year_tooltip.style("opacity", 0);
            }
        })
        .on("click", function (event, d) {
            selected_interval = {
                button: this,
                label: d.label
            };

            // move highlight bar for selection
            elements.highlight_bar
                .style("opacity", 1)
                .style("left", (this.offsetLeft + this.offsetWidth / 2 - 4) + "px")
                .style("top", (this.offsetTop - 3) + "px");


            svg.selectAll("*").remove(); // clear previous charts
            draw_interval(d.books, d.label); // draw selected interval
            show_year_tooltip(this, d.label); // permanent tooltip in the selected area
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

    elements.highlight_bar
        .style("left", (first_button.offsetLeft + first_button.offsetWidth / 2 - 4) + "px")
        .style("top", (first_button.offsetTop - 3) + "px");

    show_year_tooltip(first_button, first_interval.label);
}
