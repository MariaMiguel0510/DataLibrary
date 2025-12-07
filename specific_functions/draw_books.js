import { closeup_books } from "./closeup_books.js";

export function draw_books(
    svg,
    book_data,
    color_scale,
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
) {
    const height_scale = d3.scaleLinear()
        .domain([1, 5])
        .range([8, 60]);

    function width_scale(pages) {
        if (pages <= 200) return 12;
        else if (pages <= 400) return 17;
        else if (pages <= 600) return 22;
        else if (pages <= 800) return 27;
        else return 32;
    }

    function wrap_text(text, max_chars) {
        let words = text.split(" ");
        let lines = [];
        let current_line = "";

        words.forEach(word => {
            if ((current_line + word).length <= max_chars) {
                current_line += word + " ";
            } else {
                lines.push(current_line.trim());
                current_line = word + " ";
            }
        });

        if (current_line.length > 0) lines.push(current_line.trim());

        return lines.join("<br>");
    }

    let x_positions = [];
    let y_positions = [];
    let current_x = padding_width * 2;
    let current_y = padding_height * 1.3;
    let shelf_right_limit = padding_width + bookshelf_width - padding_width * 0.1;

    book_data.forEach(d => {
        let w = width_scale(d.pages);
        if (current_x + w > shelf_right_limit) {
            current_x = padding_width * 2;
            current_y += shelf_height;
        }
        x_positions.push(current_x);
        y_positions.push(current_y);
        current_x += w + gap;
    });

    let real_height = current_y + shelf_height + padding_height;
    books_container.node().dataset.realHeight = real_height;

    let last_shelf_y = current_y;
    let svg_height = Math.max(last_shelf_y + shelf_height, canvas_height);
    svg.attr("height", svg_height);

    update_scrollbar_visibility(books_container, svg, canvas_height);

    let book_group = svg.append("g");
    book_group.selectAll('rect')
        .data(book_data)
        .enter()
        .append('rect')
        .attr('x', (d, i) => x_positions[i])
        .attr('y', (d, i) => y_positions[i] - height_scale(Math.floor(d.rating)))
        .attr('width', d => width_scale(d.pages))
        .attr('height', d => height_scale(Math.floor(d.rating)))
        .attr('fill', d => color_scale(d.genre))
        .style('cursor', 'pointer')
        .on('click', function (event, d) {
            event.stopPropagation();
            // chama closeup_books do módulo importado
            closeup_books(containerSelector, spine_width, border, d, color_scale(d.genre), full_dataset, select_interval_by_year);
        })
        .on("mouseover", function (event, d) {
            const opacity = +d3.select(this).style("opacity");
            if (opacity === 0) return;

            book_tooltip
                .style("opacity", 1)
                .html(`${wrap_text(d.name, 30)}`);
        })
        .on("mousemove", function (event) {
            const opacity = +d3.select(this).style("opacity");
            if (opacity === 0) return;

            book_tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            book_tooltip.style("opacity", 0);
        });

    // Draw shelves for visual effect
    let shelf_levels = [];
    let shelves_for_books = Math.ceil((current_y - padding_height) / shelf_height);
    let shelves_for_canvas = Math.ceil(canvas_height / shelf_height);
    let total_shelves = Math.max(shelves_for_canvas, shelves_for_books);

    for (let i = 0; i < total_shelves; i++) {
        shelf_levels.push(padding_height * 1.3 + (i * shelf_height));
    }

    let shelf_width = document.getElementById("year_buttons_container").offsetWidth;
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

// Exemplo simples para atualizar a scrollbar — você pode ajustar conforme seu código real
function update_scrollbar_visibility(books_container, svg, canvas_height) {
    let realHeight = +books_container.node().dataset.realHeight;
    if (realHeight > canvas_height) {
        // Mostrar scrollbar, por exemplo
        books_container.style("overflow-y", "auto");
    } else {
        books_container.style("overflow-y", "hidden");
    }
}
