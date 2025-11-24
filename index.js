import { initializeBooksViz } from './specific.js';

let edition_container, edition_spine, edition_label;
let info_container, info_spine, info_label;
let specific_container, specific_spine, specific_label;
let open = false; //inicialmente todos os livros estão fechados

//INITIALIZATION
window.onload = function () {

    //EDITION BOOK
    edition_container = container(d3.select('main'), 'div', 'calc(100vw - 163px)');
    edition_spine = spine(edition_container, 'div', '80px', '90vh', '-105px', '1', 'auto', true);
    edition_label = label(edition_spine, 'h3', '2025 EDITION');

    //INFO BOOK
    info_container = container(d3.select('main'), 'div', 'calc(100vw - 143px)');
    info_spine = spine(info_container, 'div', '60px', '110vh', '0', '2', 'pointer', false);
    info_label = label(info_spine, 'h3', 'INFO');
    mouse_effect(info_spine, '#8CE8FB', 'white');//mouseover fill effect
    //OPENING TOGGLE INFO
    toggle(info_spine, [info_container, edition_container], ['calc(100vw - 143px)', 'calc(100vw - 163px)'], ['-3px', '-23px']);
    //SHOWS CONTEXT
    //seleciona o template do html e insere-o dentro do info_container
    let template = document.getElementById('context_template');
    let info_text = template.content.cloneNode(true);
    info_container.node().appendChild(info_text);

    //SPECIFIC BOOK
    specific_container = container(d3.select('main'), 'div', 'calc(100vw - 83px)');
    specific_spine = spine(specific_container, 'div', '80px', '110vh', '0', '2', 'pointer', false);
    specific_label = label(specific_spine, 'h3', 'SPECIFIC');
    initializeBooksViz(specific_container, 'books.csv');
    mouse_effect(specific_spine, '#B79FE9', 'white');//mouseover fill effect
    //OPENING TOGGLE INFO
    toggle(specific_spine, [info_container, edition_container, specific_container], ['calc(100vw - 143px)', 'calc(100vw - 163px)', 'calc(100vw - 83px)'], ['-63px', '-83px', '-3px']);


    //BOOKS CONTAINERS
    //local selecionado, o que cria, deslocamento
    function container(selected, place, move) {
        return selected
            .append(place)
            .style('width', '100vw')
            .style('height', '100vh')
            .style('left', move)
            .style('position', 'absolute')
            .style('bottom', '-20px')
            .style('background-color', 'white')
            .style('transition', 'left 0.9s');
    }

    //BOOKS SPINES
    //local selecionado, o que cria, largura, altura, deslocamento, z-index, cursor, é ou não animado
    function spine(selected, place, larg, alt, move, index, rato, animacao) {

        let spine = selected
            .append(place)
            .style('width', larg)
            .style('height', alt)
            .style('left', move)
            .style('z-index', index)
            .style('position', 'absolute')
            .style('bottom', '0px')
            .style('border', '3px solid black')
            .style('background-color', 'white')
            .style('cursor', rato);

        if (animacao == true) {
            spine
                .style('transition', 'right 0.9s')
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
}
