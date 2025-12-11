export function create_genre_buttons(
    genre_buttons_container,
    valid_genres,
    filtered_books,
    color_scale,
    selected_genres,
    genre_stroke_colors,
    window,
    padding_width,
    update_books_display,
    year_elements,
    on_genre_change // callback
) {
    
    genre_buttons_container.selectAll("button").remove();

    // set of genres that have books
    let genres_present = new Set(filtered_books.map(d => d.genre));

    // create buttons
    genre_buttons_container.selectAll("button")
        .data(valid_genres)
        .enter()
        .append("button")
        .attr("class", "genre_button")
        .text(d => d)
        .style("padding", "10px")
        .style("font-size", `${0.9}vw`)
        .style("font-family", "Poppins, sans-serif")
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
        .each(function (genre) { // apply visual state after changing the interval
            if (selected_genres.has(genre)) {
                d3.select(this)
                    .classed("selected", true)
                    .style("border", `5px solid ${genre_stroke_colors[genre]}`);
            }
        })
        .on("click", function (event, genre) {
            if (!genres_present.has(genre)) return;

            let btn = d3.select(this);

            if (selected_genres.has(genre)) {
                selected_genres.delete(genre);
                btn.classed("selected", false)
                    .style("border", `5px solid ${color_scale(genre)}`);
            } else {
                selected_genres.add(genre);
                btn.classed("selected", true)
                    .style("border", `5px solid ${genre_stroke_colors[genre]}`);
            }

            // update books by filtering by genre and reorganize pages
            update_books_display();

            // call the callback to update the count
            if (typeof on_genre_change === "function") {
                on_genre_change();
            }
        });
}
