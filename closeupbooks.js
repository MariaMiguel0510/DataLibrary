export function closeUp_books(containerSelector, spine_width, border, book, bookColor, allBooks, updateTimeline) {

    let closeup_container, closeup_container_book, closeup_book, closeup_book_height = '85vh';
    let closeup_close, closeup_btn, closeup_title, closeup_author, closeup_info;
    let duplicates, duplicates_container, duplicates_books, duplicates_columns;
    let show_cover = false; //inicialmente não estou a mostrar a capa original
    let cover_img = null;

    // Seleciona o container de close-up se existir
    closeup_container = d3.select('#closeup_container');

    // Se não existir, cria o container
    if (closeup_container.empty()) {
        closeup_container = containerSelector
            .append('div')
            .attr('id', 'closeup_container')
            .style('width', '100vw')
            .style('height', '100vh')
            .style('position', 'absolute')
            .style('top', '-20px')
            .style('background', 'rgba(255, 255, 255, 0.8)')
            .style("z-index", 3);
    }

    //remove closeups que estejam abertos
    closeup_container.select('#closeup_container_book').remove();

    //contentor que contém o livro em close up
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

    //CLOSE UP BOOK
    closeup_book = closeup_container_book
        .append('div')
        .style('width', '33vw')
        .style('height', closeup_book_height)
        .style('background-color', bookColor)
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('position', 'relative');

    //BOOK TITLE
    closeup_title = text(closeup_book, 'h4', book.name, '2vw', '600', '100%', '25vw', '0', '5vh', '10vh 3vw 0vh 3vw', null, 'break-word', 'anywhere', null);
    //BOOK AUTHOR
    closeup_author = text(closeup_book, 'h4', book.author, '1.3vw', '400', null, '20vw', '0', '3.3vh', '5vh 3vw 0vw 3vw', null, null, null, null);
    //BOOK PUBLISHER/GENRE/RATING/PAGES/LANGUAGE
    let other_data = [`Publisher: ${book.publisher}`, `Genre: ${book.genre}`, `Average Rating: ${book.rating}`, `Number of Pages: ${book.pages}`, `Language: ${book.lang}`];
    closeup_info = closeup_book
        .append('div')
        .style('margin-top', 'auto')
        .style('padding', '2vh 3vw 6vh 3vw');
    closeup_info.selectAll('p')
        .data(other_data)
        .enter()
        .append('p')
        .each(function (d) {
            text(d3.select(this), null, d, '1vw', '400', null, '20vw', null, '1vh', null, null, 'break-word', null, null);
        });

    //CLOSE X ELEMENT
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
    //CLOSE THE BOOK POP UP
    closeup_close.on('click', () => {
        if (closeup_container) closeup_container.remove(); // remove todo o close-up
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
                // repõe o conteúdo
                closeup_title.style('display', '');
                closeup_author.style('display', '');
                closeup_info.style('display', '');

                if (cover_img) {
                    cover_img.remove();
                    cover_img = null;
                }
            } else {
                // retira o conteúdo
                closeup_title.style('display', 'none');
                closeup_author.style('display', 'none');
                closeup_info.style('display', 'none');

                //se a capa ainda não foi carregada
                if (!cover_img) {
                    //e existir isbn
                    if (book.isbn) {
                        const coverURL = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
                        try {
                            //verifica se a imagem existe
                            let response = await fetch(coverURL, { method: 'HEAD' });
                            //desenha a capa
                            if (response.ok) {
                                cover_img = closeup_book
                                    .append('img')
                                    .attr('src', coverURL)
                                    .style('object-fit', 'contain')
                                    .style('position', 'relative')
                                    .style('max-width', '100%')
                                    .style('height', `calc(${closeup_book_height} - 16vh)`)
                                    .style('padding', '10vh 11vw 0vh 3vw')
                            } else {//mensagem de não haver capa
                                cover_img = text(closeup_book, 'div', 'Cover not found', '2vw', '400', null, '25vw', '0', null, '10vh 3vw 0vh 3vw', null, null, null, null);
                            }
                        } catch (err) {//mensagem de erro
                            console.error(err);
                            cover_img = text(closeup_book, 'div', 'Error loading cover', '2vw', '400', null, '25vw', '0', null, '10vh 3vw 0vh 3vw', null, null, null, null);
                        }
                    } else {// caso o CSV não tenha ISBN
                        cover_img = text(closeup_book, 'div', 'ISBN missing', '2vw', '400', null, '25vw', '0', null, '10vh 3vw 0vh 3vw', null, null, null, null);
                    }
                }
            }
        }
        show_cover = !show_cover; // inverte a interação do botão
    });

    //BOOKS WIDTH SAME AUTHOR AND TITLE
    duplicates = allBooks.filter(b => b.name === book.name && b.author === book.author);

    //se houver mais de que um livro com o mesmo titulo e autor
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
        let max = 4;  //nº máximo de livros por coluna
        let nC = Math.ceil(duplicates.length / max);//nº de colunas criadas

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
                    .style('height', `calc(((${closeup_book_height} - 6vh)/ 4))`)//6vh por causa do gap (2vh)
                    .style('background-color', bookColor)
                    .style('position', 'relative')
                    .style('cursor', 'pointer')
                    .on('click', () => {
                        closeUp_books(containerSelector, spine_width, border, dupBook, bookColor, allBooks, updateTimeline);
                        //atualiza a estante quando se muda de ano
                        if (updateTimeline) updateTimeline(dupBook.date, book.date);
                    });

                //DUPLICATES TITLE
                text(duplicates_books, 'p', dupBook.name, '0.9vw', '600', null, '5vw', '0', '1.8vh', '2vh 1vw 0vh 1vw', 'relative', 'break-word', 'break-word', '0');
                //DUPLICATES PUBLISHER
                text(duplicates_books, 'p', dupBook.publisher, '0.8vw', '400', null, '5vw', '0', '1.8vh', '2vh 1vw 0vh 1vw', 'relative', 'break-word', 'break-word', '0');
                //DUPLICATES YEAR
                text(duplicates_books, 'p', dupBook.date, '0.8vw', '400', null, 'auto', '0', '1em', '0vh 1vw 0vh 1vw', 'absolute', 'break-word', 'break-word', '2vh');
            });
        }
    }

    function text(place, format, conteudo, font_size, peso, max, larg, margem, entrelinha, paddng, pos, corte_1, corte_2, fundo) {
        let elem = place;

        //se 'format' for definido, cria o elemento dentro do 'place'
        if (format) {
            elem = place.append(format);
        }

        elem.text(conteudo)
            .style('font-size', font_size)
            .style('font-weight', peso)
            .style('max-width', max)
            .style('width', larg)
            .style('margin', margem)
            .style('line-height', entrelinha)
            .style('padding', paddng)
            .style('position', pos)
            .style('overflow-wrap', corte_1)
            .style('word-wrap', corte_2)
            .style('bottom', fundo);

        return elem;
    }
}
