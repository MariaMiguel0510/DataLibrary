// CREATE BUTTONS
export function create_selection_buttons({
    container,
    padding_width,
    get_current_selection
}) {

    container.selectAll("*").remove();

    let selection_modes = [
        { id: "genre", label: "Genre" },
        { id: "author", label: "Author" },
        { id: "publisher", label: "Publisher" },
        { id: "language", label: "Language" }
    ];

    // Dropdown wrapper
    let dropdown = container
        .append("div")
        .style("position", "relative")
        .style("width", `${(window.innerWidth * 0.17) - padding_width}px`)
        .style('height', `${(window.innerHeight * 0.05)}px`);

    // Main button
    let main_button = dropdown.append("button")
        .attr("id", "selection_main_button")
        .style("padding", "10px")
        .style("font-size", `${0.9}vw`)
        .style("width", `${(window.innerWidth * 0.17) - padding_width}px`)
        .style('height', `${(window.innerHeight * 0.05)}px`)
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
        .style("width", `${(window.innerWidth * 0.17) - padding_width}px`)
        .style('height', `${(window.innerHeight * 0.05)}px`)
        .style('margin-top', '-2px')
        .style("background", "grey")
        .style("display", "none")
        .style("flex-direction", "column")
        .style("z-index", 10);

    function rebuild_menu() {
        menu.selectAll("*").remove();

        let current_selection = get_current_selection();

        menu.selectAll("button")
            .data(selection_modes.filter(d => d.id !== current_selection))
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