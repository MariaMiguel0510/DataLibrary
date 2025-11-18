let books;
let canvas_width, canvas_height, padding_width, padding_height, bookshelf_width, gap, shelf_height;

window.onload = function () {
    // graph general attributes
    canvas_width = window.innerWidth * 0.75;
    canvas_height = window.innerHeight * 0.80;
    padding_width = 40;
    padding_height = 60;
    bookshelf_width = canvas_width - padding_width * 2;
    gap = 2;
    shelf_height = 80;

    // new svg element
    svg = d3.select('body')
        .append('svg')
        .attr('width', canvas_width)
        .attr('height', canvas_height);


    books = "livros_dados.csv";

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
    }).then(smallMultiples);
}


function smallMultiples(data) {

    // create intervals of 5 years
    function interval(year) {
        year = +year;
        const start = Math.floor(year / 5) * 5;
        const end = start + 5;
        return { start, end, label: `${start}-${end}` };
    }

    // group books by intervals
    let group_interval = d3.group(data, d => interval(d.date).label);

    // show intervals with at least 10 books
    let valid_intervals = Array.from(group_interval)
        .filter(([intervalLabel, livros]) => livros.length >= 10);

    // sort years cronologically
    valid_intervals.sort((a, b) => {
        const startA = +a[0].split("-")[0];
        const startB = +b[0].split("-")[0];
        return d3.ascending(startA, startB);
    });
    // console.log(valid_intervals);

    // create buttons container
    d3.select('#year_buttons_container').remove(); // remove old container, if there is any
    let year_buttons_container = d3.select('body')
        .append('div')
        .attr('id', 'buttons-container')
        .style('position', 'fixed')
        .style('bottom', '60px')
        .style('left', '90px')

    // create buttons for each interval of years
    year_buttons_container.selectAll('button')
        .data(valid_intervals)
        .enter()
        .append('button')
        .text(d => d[0])  // text of the button = interval of years
        .style('margin-right', '-2px')
        .style('padding', '10px')
        .style('background-color', 'white')
        .on('click', (event, d) => {
            // clear previous charts
            svg.selectAll("*").remove();

            // call fuction to draw the selected interval
            draw_interval(d[1]);
        });

    // by default, it shows the first interval
    draw_interval(valid_intervals[0][1]);

    // função para desenhar livros do intervalo selecionado
    function draw_interval(selected_interval) {

        // obter todos os gêneros únicos
        let unique_genres = Array.from(new Set(selected_interval.map(d => d.genre)));
        console.log(unique_genres);

        // criar escala de cores para os gêneros
        let color_scale = d3.scaleOrdinal()
            .domain(unique_genres)
            .range(d3.schemeSet2);

        // scale book height according to its rating
        const height_scale = d3.scaleLinear()
            .domain([1, 5])
            .range([10, 70]);

        // scale book width according to its pages
        function width_scale(pages) {
            if (pages <= 200) return 15;
            else if (pages <= 400) return 20;
            else if (pages <= 600) return 30;
            else if (pages <= 800) return 40;
            else return 50; // more than 800
        }

        // create a group to organize its position
        let book_group = svg.append("g")
            .attr("transform", `translate(${padding_width}, ${padding_height})`);

        let filtered_books = selected_interval.filter(d => d.rating > 0);

        // calculate positions
        let x_positions = [];
        let y_positions = [];
        let current_x = padding_width;
        let current_y = padding_height;

        filtered_books.forEach(d => {
            let w = width_scale(d.pages);

            // se passar do limite, quebra linha
            if (current_x + w > padding_width + bookshelf_width) {
                current_x = padding_width;
                current_y += shelf_height;
            }

            x_positions.push(current_x);
            y_positions.push(current_y);

            current_x += w + 5;
        });

        // draw books
        book_group.selectAll('rect')
            .data(filtered_books)  // pega os livros do primeiro intervalo
            .enter()
            .append('rect')
            .attr('x', (d, i) => x_positions[i])
            .attr('y', (d, i) => y_positions[i] - height_scale(Math.floor(d.rating)))
            .attr('width', d => width_scale(d.pages))
            .attr('height', d => height_scale(Math.floor(d.rating)))
            .attr('fill', d => color_scale(d.genre));
    }

}