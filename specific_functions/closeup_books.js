export function closeup_books(container_selector, spine_width, border, book, book_color, stroke_color, all_books, update_timeline) {
    console.log("DATA COMPLETA DO LIVRO:", book.full_date);

    let closeup_container, closeup_container_book, closeup_book, closeup_book_height = '85vh';
    let closeup_close, closeup_btn, closeup_title, closeup_author, closeup_info;
    let duplicates, duplicates_container, duplicates_books, duplicates_columns;
    let show_cover = false; //initially it doesnt show the original cover
    let cover_img = null;

    // select close-up container
    closeup_container = d3.select('#closeup_container');

    // if it doesn't exist, creates the container
    if (closeup_container.empty()) {
        closeup_container = container_selector
            .append('div')
            .attr('id', 'closeup_container')
            .style('width', '100vw')
            .style('height', '100vh')
            .style('position', 'absolute')
            .style('top', '-20px')
            .style('background', 'rgba(255, 255, 255, 0.8)')
            .style("z-index", 3);
    }

    // remove upen close-ups
    closeup_container.select('#closeup_container_book').remove();

    // container with the close-up book 
    closeup_container_book = closeup_container
        .append('div')
        .attr('id', 'closeup_container_book')
        .style('width', '75vw')
        .style('height', '100vh')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('top', '7vh')
        .style('position', 'relative')
        .style('left', `${spine_width + border}px`);

    // CLOSE-UP BOOK
    closeup_book = closeup_container_book
        .append('div')
        .style('width', '33vw')
        .style('height', closeup_book_height)
        .style('background-color', book_color)
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('position', 'relative');

    // FULL DATE OF PUBLICATION
    let [year, month, day] = book.full_date.split("-");
    let formatted_date = `${day}-${month}-${year}`; // new order: day-month-year
    let digits = formatted_date.replace(/-/g, ""); // "2002-04-08" → "20020408" 
    console.log("DIGITOS PARA CODIGO DE BARRAS:", digits);

    // BARCODE
    let barcode = closeup_book
        .append("div")
        .attr("id", "barcode")
        .style("position", "absolute")
        .style("top", "-3vh")
        .style("left", "0")
        .style("width", "100%")
        .style("display", "flex")
        .style("flex-direction", "row")
        .style("gap", "10px")
        .style("opacity", "0.2")
        .style("padding", "3vh 0 0 0");


    // valores 
    let values = digits.split("").map(d => (+d * 4) + 6);

    // soma dos valores
    let totalValue = d3.sum(values);

    // largura total disponível para o código de barras
    let availableWidth = closeup_book.node().getBoundingClientRect().width;

    // gap entre barras
    let gap = 10;
    let totalGap = gap * (values.length - 1);

    // largura útil para as barras
    let usableWidth = availableWidth - totalGap;

    // cria as barras proporcionais
    values.forEach((v, i) => {

        // largura proporcional
        let barWidth = (v / totalValue) * usableWidth;

        barcode.append("div")
            .style("height", closeup_book_height)
            .style("width", `${barWidth}px`)
            .style("background-color", stroke_color)
            .style("margin-right", i < values.length - 1 ? `${gap}px` : "0px");
    });


    // TITLE
    closeup_title = text(closeup_book, 'h4', book.name, '2vw', '600', '25vw', '0', '5vh', '10vh 3vw 0vh 3vw', null, 'break-word', 'anywhere', null);
    
    // AUTHOR
    closeup_author = text(closeup_book, 'h4', book.author, '1.3vw', '400', '20vw', '0', '3.3vh', '5vh 3vw 0vw 3vw', null, null, null, null);
    
    // PUBLISHER/GENRE/RATING/PAGES/LANGUAGE
    let other_data = [`Publisher: ${book.publisher}`, `Publication date: ${formatted_date}`, `Genre: ${book.genre}`, `Average Rating: ${book.rating}`, `Number of Pages: ${book.pages}`, `Language: ${book.lang}`];
    closeup_info = closeup_book
        .append('div')
        .style('margin-top', 'auto')
        .style('padding', '2vh 3vw 6vh 3vw')
        .style('z-index', 5);

    closeup_info.selectAll('p')
        .data(other_data)
        .enter()
        .append('p')
        .each(function (d) {
            text(d3.select(this), null, d, '1vw', '400', '20vw', null, '1vh', null, null, 'break-word', null, null);
        });

    // X ELEMENT
    closeup_close = closeup_book
        .append('svg')
        .attr('width', 24)
        .attr('height', 24)
        .attr('viewBox', '0 0 24 24')
        .style('position', 'absolute')
        .style('top', '3vh')
        .style('right', '1.5vw')
        .style('cursor', 'pointer')
        .style('z-index', '10');

    closeup_close.append('line')
        .attr('x1', 6).attr('y1', 6)
        .attr('x2', 21).attr('y2', 21)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

    closeup_close.append('line')
        .attr('x1', 21).attr('y1', 6)
        .attr('x2', 6).attr('y2', 21)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

    // CLOSE THE BOOK POP UP
    closeup_close.on('click', () => {
        if (closeup_container) closeup_container.remove(); // removes the close-up
    });

    //BUTTON ORIGINAL COVER
    closeup_btn = closeup_book
        .append('div')
        .text('Cover')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('background-color', 'none')
        .style('border', '2px solid black')
        .style('position', 'absolute')
        .style('top', '3vh')
        .style('left', '3vw')
        .style('width', '5vw')
        .style('height', '3.5vh')
        .style('cursor', 'pointer')
        .style('font-size', '1vw')
        .style('font-weight', '600')
        .style('z-index', '10');

    //SHOW ORIGINAL COVER
    closeup_btn.on('click', async () => {
        if (closeup_book) {
            if (show_cover) {
                // restore the content
                closeup_title.style('display', '');
                closeup_author.style('display', '');
                closeup_info.style('display', '');

                if (cover_img) {
                    cover_img.remove();
                    cover_img = null;
                }
            } else {
                // removes the content
                closeup_title.style('display', 'none');
                closeup_author.style('display', 'none');
                closeup_info.style('display', 'none');

                // if the cover isnt loaded
                if (!cover_img) {
                    // and isbn exists
                    if (book.isbn) {
                        const coverURL = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
                        try {
                            // verify if the image exists 
                            let response = await fetch(coverURL, { method: 'GET' });
                            // draw the cover
                            if (response.ok) {
                                cover_img = closeup_book
                                    .append('img')
                                    .attr('src', coverURL)
                                    .style('object-fit', 'contain')
                                    .style('position', 'relative')
                                    .style('max-width', '100%')
                                    .style('height', `calc(${closeup_book_height} - 16vh)`)
                                    .style('padding', '10vh 11vw 0vh 3vw')
                            } else { //message indicating there is no cover
                                cover_img = text(closeup_book, 'div', 'Cover not found', '2vw', '400', '25vw', '0', null, '10vh 3vw 0vh 3vw', null, null, null, null);
                            }
                        } catch (err) { // error message
                            console.error(err);
                            cover_img = text(closeup_book, 'div', 'Error loading cover', '2vw', '400', '25vw', '0', null, '10vh 3vw 0vh 3vw', null, null, null, null);
                        }
                    } else { // if the csv doesnt have the isbn
                        cover_img = text(closeup_book, 'div', 'ISBN missing', '2vw', '400', '25vw', '0', null, '10vh 3vw 0vh 3vw', null, null, null, null);
                    }
                }
            }
        }
        show_cover = !show_cover; // reverses the button interaction
    });

    //BOOKS WITH SAME AUTHOR AND TITLE 
    duplicates = all_books.filter(b => b.name === book.name && b.author === book.author);

    // if theres more than 1 book with the same title and author
    if (duplicates.length > 1) {
        duplicates_container = closeup_container_book
            .append('div')
            .style('height', closeup_book_height)
            .style('margin', '0vh 0vw 0vh 1vw')
            .style('display', 'flex')
            .style('flex-direction', 'row')
            .style('gap', '1vw')
            .style('justify-content', 'flex-start')
            .style('position', 'relative')
            .style('top', '0');

        //CREATE THE NUMER OF EXISTING DUPLICATES
        let max = 4;  // maximum number of books per column
        let nC = Math.ceil(duplicates.length / max); // number of columns created

        for (let i = 0; i < nC; i++) {
            duplicates_columns = duplicates_container
                .append('div')
                .style('display', 'flex')
                .style('flex-direction', 'column')
                .style('gap', '2vh');

            //BOOKS PER COLUMN
            let start = i * max;
            let end = start + max;
            let booksInColumn = duplicates.slice(start, end);

            booksInColumn.forEach(dupBook => {
                duplicates_books = duplicates_columns
                    .append('div')
                    .style('width', '7vw')
                    .style('height', `calc(((${closeup_book_height} - 6vh)/ 4))`)
                    .style('background-color', book_color)
                    .style('position', 'relative')
                    .style('cursor', 'pointer')
                    .on('click', () => {
                        closeup_books(container_selector, spine_width, border, dupBook, book_color, all_books, update_timeline);
                        // updates the bookshelf when the year changes
                        if (update_timeline) update_timeline(dupBook.date, book.date);
                    });

                //DUPLICATES TITLE
                text(duplicates_books, 'p', dupBook.name, '0.9vw', '600', '5vw', '0', '1.8vh', '2vh 1vw 0vh 1vw', 'relative', 'break-word', 'break-word', '0');
                //DUPLICATES PUBLISHER
                text(duplicates_books, 'p', dupBook.publisher, '0.8vw', '400', '5vw', '0', '1.8vh', '2vh 1vw 0vh 1vw', 'relative', 'break-word', 'break-word', '0');
                //DUPLICATES YEAR
                text(duplicates_books, 'p', dupBook.date, '0.8vw', '400', 'auto', '0', '1em', '0vh 1vw 0vh 1vw', 'absolute', 'break-word', 'break-word', '2vh');
            });
        }
    }

    // place where its created / what is created / text 
    function text(place, format, text, font_size, weight, width, margin, lineheight, padding, pos, overflow, break_word, bottom) {
        let elem = place;

        // if 'format' is defined, it creates the element inside the 'place' tag
        if (format) {
            elem = place.append(format);
        }

        elem.text(text)
            .style('font-size', font_size)
            .style('font-weight', weight)
            .style('width', width)
            .style('margin', margin)
            .style('line-height', lineheight)
            .style('padding', padding)
            .style('position', pos)
            .style('overflow-wrap', overflow) // break if it needs to 
            .style('word-wrap', break_word) // break every word
            .style('bottom', bottom)
            .style('z-index', 5);

        return elem;
    }
}
