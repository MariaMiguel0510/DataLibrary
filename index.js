import { initializeBooksViz } from './specific.js';

let edition_width, edition_container, edition_spine, edition_label;
let info_width, info_container, info_spine, info_label, info_text;
let specific_width, specific_container, specific_spine, specific_label;
let open = false; // inicialmente todos os livros estão fechados
let border = 3; // grossura da borda dos livros

// INITIALIZATION
window.onload = function () {
    //INICIAL WIDTHS
    getWidths();

    //EDITION BOOK
    edition_container = container(d3.select('main'), 'div');
    edition_spine = spine(edition_container, 'div', edition_width, '90vh', -(specific_width*1.22), 1, 'auto', true);
    edition_label = label(edition_spine, 'h3', '2025 EDITION');

    //INFO BOOK
    info_container = container(d3.select('main'), 'div');
    info_spine = spine(info_container, 'div', info_width, '110vh', 0, 2, 'pointer', false);
    info_label = label(info_spine, 'h3', 'INFO');
    mouse_effect(info_spine, '#8CE8FB', 'white');
    //SHOWS CONTEXT
    //seleciona o template do html e insere-o dentro do info_container
    let template = document.getElementById('context_template');
    info_text = template.content.cloneNode(true);
    info_container.node().appendChild(info_text);
    //TOGGLE INFO
    toggle(info_spine, [info_container, edition_container],
        [`${window.innerWidth - (specific_width + info_width + border)}px`,
        `${window.innerWidth - (specific_width + edition_width + border)}px`],
        [`${-border}px`, `calc(-${edition_width - info_width}px - ${border}px)`]);

    //SPECIFIC BOOK
    specific_container = container(d3.select('main'), 'div');
    specific_spine = spine(specific_container, 'div', specific_width, '110vh', 0, 2, 'pointer', false);
    specific_label = label(specific_spine, 'h3', 'SPECIFIC');
    //IMPORT DATA VISUALIZATION
    initializeBooksViz(specific_container, 'books.csv');
    mouse_effect(specific_spine, '#B79FE9', 'white');
    //TOGGLE SPECIFIC
    toggle(specific_spine, [info_container, edition_container, specific_container],
        [`${window.innerWidth - (specific_width + info_width + border)}px`,
        `${window.innerWidth - (specific_width + edition_width + border)}px`,
        `${window.innerWidth - (specific_width + border)}px`],
        [`${-info_width - border * 2}px`, `${-edition_width - border * 2}px`, `${-border}px`]);

    //POSITION UPDATES
    updatePositions();

    //WINDOW RESIZE
    //permite redimensionar os valores dos contentores e das abas 
    //e respetivas posições em função da largura da janela
    window.addEventListener('resize', () => {
        getWidths();
        updatePositions();
    });
};

//RESPONSIVE WIDTHS
function getWidths() {
    const total = window.innerWidth;//largura total da janela
    edition_width = total * 0.06; // 7% da largura total
    info_width = total * 0.05;    // 4.4% da largura total
    specific_width = total * 0.07; // 8% da largura total
}

//UPDATE CONTAINERS AND SPINES
//permite atualizar a posição dos contentores e das abas, 
//para que ao redimensionar a janela os seus valores se adaptem
function updatePositions() {
    //containers
    edition_container.style('left', `${window.innerWidth - (specific_width + edition_width + border)}px`);
    info_container.style('left', `${window.innerWidth - (specific_width + info_width + border)}px`);
    specific_container.style('left', `${window.innerWidth - (specific_width + border)}px`);
    //spines
    edition_spine.style('width', `${edition_width}px`);
    info_spine.style('width', `${info_width}px`);
    specific_spine.style('width', `${specific_width}px`);
}

//BOOKS CONTAINERS
//local selecionado, o que cria, deslocamento
function container(selected, place) {
    return selected
        .append(place)
        .style('width', '100vw')
        .style('height', '100vh')
        .style('position', 'absolute')
        .style('bottom', '-20px')
        .style('background-color', 'white')
        .style('transition', 'left 0.9s');
}

//BOOKS SPINES
//local selecionado, o que cria, largura, altura, deslocamento, z-index, cursor, é ou não animado
function spine(selected, place, larg, alt, move, index, cursor, animacao) {
    let spine = selected
        .append(place)
        .style('width', `${larg}px`)
        .style('height', alt)
        .style('left', `${move}px`)
        .style('z-index', index)
        .style('position', 'absolute')
        .style('bottom', '0px')
        .style('border', `${border}px solid black`)
        .style('background-color', 'white')
        .style('cursor', cursor);

    if (animacao) {
        spine
            .style('transition', 'right 0.9s, transform 0.9s')
            .style('transform', 'rotate(9deg)');
    }
    return spine;
}

//BOOKS LABELS
function label(selected, place, texto) {
    return selected
        .append(place)
        .text(texto)
        .style('font-size', '25px')
        .style('font-weight', '600')
        .style('margin', '0')
        .style('bottom', '70px')
        .style('width', '100%')
        .style('writing-mode', 'vertical-lr')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('transform', 'scale(-1,-1)')
        .style('transform-origin', 'center');
}

//OPENING TOGGLE
//elemento de click, contentores a mover, valores pos abertura, valores pos inicial)
function toggle(spine, containers, openValues, closedValues) {
    spine.on('click', function () {
        for (let i = 0; i < containers.length; i++) {//para todos os contentores existentes
            if (open) { //se estiver fechado
                containers[i].style('left', openValues[i]);
            } else {//se estiver aberto
                containers[i].style('left', closedValues[i]);
            }
        }
        open = !open; //inverte movimento
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


