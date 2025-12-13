import { initializeBooksViz } from './specific.js';

let edition_width, edition_container, edition_spine, edition_label;
let info_width, info_container, info_spine, info_label, info_text;
let specific_width, specific_container, specific_spine, specific_label;
let random_book_width, random_book_container, random_book_spine, random_book_label;
let current_random_title;
let info_open = false; // info initially closed 
let specific_open = false; // specific initially closed 
let border = 3; // thickness of book border


// INITIALIZATION
window.onload = function () {
    //INICIAL WIDTHS
    getWidths();

    //RANDOM BOOK
    random_book_container = container(d3.select('main'), 'div');
    random_book_spine = spine(random_book_container, 'div', random_book_width, '90vh', 0, 1, 'pointer', true, `rotate(16deg) translate(-25.4vh, 8.2vh)`);
    random_book_label = label(random_book_spine, 'h3', 'RANDOM BOOK TITLE', 'pointer');
    startRandomBookTitles(random_book_label, 'books.csv', 25, (title) => { current_random_title = title; });

    //EDITION BOOK
    edition_container = container(d3.select('main'), 'div');
    edition_spine = spine(edition_container, 'div', edition_width, '90vh', 0, 1, 'default', true, `rotate(9deg) translate(-14.3vh, 3.1vh)`);
    edition_label = label(edition_spine, 'h3', '2025 EDITION', 'default');

    //INFO BOOK
    info_container = container(d3.select('main'), 'div');
    info_spine = spine(info_container, 'div', info_width, `calc(100vh - 5px)`, 0, 2, 'pointer', false, null);
    info_label = label(info_spine, 'h3', 'INFO', 'pointer');
    mouse_effect(info_spine, '#A3CCFF', '#F6F6F6');

    //SHOWS CONTEXT
    //selects the html template and inserts it into info_container
    let template = document.getElementById('context_template');
    info_text = template.content.cloneNode(true);
    info_container.node().appendChild(info_text);

    //TOGGLE INFO
    toggle(info_spine, info_open, [info_container, edition_container, random_book_container],
        [`${window.innerWidth - (specific_width + info_width + (border * 3))}px`,
        `${window.innerWidth - (specific_width + info_width + edition_width + (border * 3))}px`,
        `${window.innerWidth - (specific_width + info_width + edition_width + random_book_width + (border * 3))}px`],
        ['0px', `calc(-${edition_width}px)`, `calc(-${edition_width + random_book_width}px)`]);

    //SPECIFIC BOOK
    specific_container = container(d3.select('main'), 'div');
    specific_spine = spine(specific_container, 'div', specific_width, `calc(100vh - 5px)`, 0, 2, 'pointer', false, null);
    specific_label = label(specific_spine, 'h3', 'VISUALIZATION', 'pointer');

    //IMPORT DATA VISUALIZATION
    initializeBooksViz(specific_container, specific_width, border, 'books.csv');
    mouse_effect(specific_spine, '#C688CB', '#F6F6F6');

    //TOGGLE SPECIFIC
    toggle(specific_spine, specific_open, [info_container, edition_container, specific_container, random_book_container],
        [`${window.innerWidth - (specific_width + info_width + (border * 3))}px`,
        `${window.innerWidth - (specific_width + info_width + edition_width + (border * 3))}px`,
        `${window.innerWidth - (specific_width + (border * 3))}px`,
        `${window.innerWidth - (specific_width + info_width + edition_width + random_book_width + (border * 3))}px`],
        [`${-info_width}px`, `calc(-${edition_width + info_width}px)`, '0px', `calc(-${random_book_width + edition_width + info_width}px)`]);

    //POSITION UPDATES
    updatePositions();

    //WINDOW RESIZE
    // allows to resize the values ​​of the containers and tabs
    // and their respective positions depending on the window width
    window.addEventListener('resize', () => {
        getWidths();
        updatePositions();
    });
};

//RESPONSIVE WIDTHS
function getWidths() {
    const total = window.innerWidth; // total window width
    edition_width = total * 0.06;
    info_width = total * 0.05;
    specific_width = total * 0.07;
    random_book_width = total * 0.04;
}

//UPDATE CONTAINERS AND SPINES
//allows  to update the position of the containers and flaps -> when the window is resized, its values ​​adapt
function updatePositions() {
    //containers
    edition_container.style('left', `${window.innerWidth - (specific_width + info_width + edition_width + (border * 3))}px`);
    random_book_container.style('left', `${window.innerWidth - (specific_width + info_width + edition_width + random_book_width + (border * 3))}px`);
    info_container.style('left', `${window.innerWidth - (specific_width + info_width + (border * 3))}px`);
    info_container.style('height', '100vh');
    info_container.style('bottom', '-20px');
    specific_container.style('left', `${window.innerWidth - (specific_width + (border * 2))}px`);
    specific_container.style('height', '100vh');
    specific_container.style('bottom', '-20px');

    //spines
    edition_spine.style('width', `${edition_width}px`);
    random_book_spine.style('width', `${random_book_width}px`)
    info_spine.style('width', `${info_width}px`);
    info_spine.style('bottom', '20px');
    specific_spine.style('width', `${specific_width}px`);
    specific_spine.style('bottom', '20px');
}

//BOOKS CONTAINERS
//local selecionado, o que cria, deslocamento
function container(selected, place) {
    return selected
        .append(place)
        .style('width', '100vw')
        .style('height', '100vh')
        .style('position', 'absolute')
        .style('bottom', '0')
        .style('background-color', '#F6F6F6')
        .style('transition', 'left 0.9s');
}

//BOOKS SPINES
//local selecionado, o que cria, largura, altura, deslocamento, z-index, cursor, é ou não animado
function spine(selected, place, larg, alt, move, index, cursor, roda, pos) {
    let spine = selected
        .append(place)
        .style('width', `${larg}px`)
        .style('height', alt)
        .style('left', `${move}px`)
        .style('z-index', index)
        .style('position', 'absolute')
        .style('bottom', '0px')
        .style('border', `${border}px solid black`)
        .style('background-color', '#F6F6F6')
        .style('cursor', cursor)
        .style('z-index', 10);

    if (roda) {
        spine
        spine.style('bottom', '5px')
            .style('transform', pos)
            .style('transform-origin', '100% 100%');
    }
    return spine;
}

//BOOKS LABELS
function label(selected, place, texto, cursor) {
    return selected
        .append(place)
        .text(texto)
        .style('font-size', '25px')
        .style('font-weight', '600')
        .style('margin', '0')
        .style('bottom', '50px')
        .style('width', '100%')
        .style('writing-mode', 'vertical-lr')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('transform', 'scale(-1,-1)')
        .style('transform-origin', 'center')
        .style('cursor', cursor);
}


//RANDOM TITLES
function startRandomBookTitles(labelSelection, csvFile, maxLength, callback) {
    d3.csv(csvFile).then(data => {
        let titles = data
            .map(d => d.Name)//gets the title
            .filter(d => d && d.trim() !== "");//excludes null values

        if (titles.length === 0) return;//in case of inexisting title stops

        function updateTitle() {
            let randomTitle = titles[Math.floor(Math.random() * titles.length)];

            labelSelection.text(
                randomTitle
                    .toUpperCase()//change all the title to uppercase
                    .slice(0, maxLength)//max of caracters shown
            );
            if (callback) callback(randomTitle);
        }

        //inicial title
        updateTitle();
        //change title every 2 seconds
        setInterval(updateTitle, 2000);
    });
}

//OPENING TOGGLE
//elemento de click, contentores a mover, valores pos abertura, valores pos inicial)
function toggle(spine, open, containers, openValues, closedValues) {
    spine.on('click', function () {
        for (let i = 0; i < containers.length; i++) { // for all the existing containers
            if (open) {
                containers[i].style('left', openValues[i]);
            } else {
                containers[i].style('left', closedValues[i]);
            }
        }

        open = !open; // inverts the movement
    });
}

//MOUSE OVER FILL EFFECT
function mouse_effect(spine, hoverColor, normalColor) {
    spine
        .on('mouseover', function () {
            d3.select(this).style('background-color', hoverColor);
        })
        .on('mouseout', function () {
            d3.select(this).style('background-color', normalColor);
        });
}


