export function create_genre_buttons(
    genre_buttons_container,
    valid_genres,
    filtered_books,
    color_scale,
    selected_genres,
    update_visible_books_count,
    genre_stroke_colors,
    window,
    padding_width,
    svg
) {
    genre_buttons_container.selectAll("button").remove();

    // Set dos géneros presentes no intervalo
    let genres_present = new Set(filtered_books.map(d => d.genre));

    genre_buttons_container.selectAll("button")
        .data(valid_genres)
        .enter()
        .append("button")
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