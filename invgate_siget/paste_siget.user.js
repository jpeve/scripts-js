// ==UserScript==
// @name         InvGate Paste SIGET
// @namespace    ar.jpeve.paste
// @version      0.5
// @description  Mejora: pega el contenido copiado de InvGate dentro de Siget.
// @author       Javier Peverelli
// @match        http://siget.softtekosde.com:8080/siget/ticketsn*
// @updateURL    https://github.com/jpeve/scripts-js/raw/main/invgate_siget/paste_siget.meta.js
// @downloadURL  https://github.com/jpeve/scripts-js/raw/main/invgate_siget/paste_siget.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    //const nivel = window.location.href.includes('ticketsn2') ? 2 : 3;
    const table = document.querySelector('.ui-jqgrid-btable tbody');
    const setInput = (tr, selector, value, text = false) => {
        let input = tr.querySelector(selector);
        if (!input) return;
        if (input.tagName.toLowerCase() === 'input') {
            input.value = value;
        } else if (input.tagName.toLowerCase() === 'select') {
            let opt = '';
            if(text){
                opt = Array.from(input.childNodes).find(opt => opt.innerHTML.toLowerCase() === value.toLowerCase());
            } else {
                opt = Array.from(input.childNodes).find(opt => opt.value.toLowerCase() === value.toLowerCase());
            }
            if (opt) opt.selected = true;
        }
        input.dispatchEvent(new Event('change'));
    };
    const addPasteEvent = node => {
        node.addEventListener('paste', ev => {
            const tr = ev.currentTarget;
            const data = ev.clipboardData.getData('text/plain').trim().split(/\t/);
            //if (data.length !== 8) return;
            ev.preventDefault();
            const [tipo, ticket, app, title, user, priority, state, date] = data;
            console.log([tipo, ticket, app, title, user, priority, state, date]);
            setInput(tr, '[name=tipo', tipo);
            setInput(tr, '[name$=idTicket]', ticket);
            //setInput(tr, '[aria-describedby*=tipoTarea] select', 'Ticket');
            setInput(tr, '[name=sumario]', title);
            setInput(tr, '[aria-describedby*=appName] select', app, true);
            setInput(tr, '[name="asignado"]', user);
            setInput(tr, '[name=prioridad]', priority);
            setInput(tr, '[aria-describedby*=estado] select', state);
            setInput(tr, '[name=fechaCreado]', date);
            setInput(tr, '[name=fechaIngresoN3]', date);
        });
    };
    new MutationObserver((mutations, observer) => {
        mutations.forEach(({type, addedNodes}) => {
            Array.from(addedNodes)
                .filter(({classList, tagName}) => tagName === 'TR' && classList.contains('jqgrid-new-row'))
                .forEach(addPasteEvent);
            Array.from(addedNodes)
                .filter(({id, tagName}) => tagName === 'INPUT' && /\w+-\d+_.*ticket/i.test(id))
                .forEach(input => {
                input.value = input.id.match(/\w+-\d+/)[0];
                addPasteEvent(input.parentNode.parentNode);
            });
        });
    }).observe(table, { childList: true, subtree: true });
})();