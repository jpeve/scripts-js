// ==UserScript==
// @name         InvGate Copy SIGET
// @namespace    ar.jpeve.copy
// @version      0.1
// @description  Mejora: copia el contenido de un ticket de InvGate para luego pegarlo en Siget
// @author       Javier Peverelli
// @match        https://pau.osde.com.ar/requests/show/index/id/*
// @updateURL    https://github.com/jpeve/scripts-js/raw/master/invgate_siget/invgate_copy.user.js
// @downloadURL  https://github.com/jpeve/scripts-js/raw/master/invgate_siget/invgate_copy.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const equipo = {
        "ROSA DE MARIA CANAL ODICIO"     : "rosa.canal.so",
        "JULISSA ATIA"                   : "julissa.atia.so",
        "JAVIER PEVERELLI"               : "javier.peverelli.so",
        "MARIELA VIVIANA SANDEZ"         : "mariela.sandez.so",
        "MARINA ANDREA LENCINAS PERESSI" : "marina.lencinas.so",
        "MARIANA VELAZQUEZ"              : "mariana.velazquez.so",
        "ALAN PRADA"                     : "alan.prada.so",
        "DÉBORA ALTAMIRANO"              : "debora.altamirano.so",
        "LUCAS PERRINO"                  : "lucas.perrino.so",
    }
    const meses = {
        "ene." : "01",
        "feb." : "02",
        "mar." : "03",
        "abr." : "04",
        "may." : "05",
        "jun." : "06",
        "jul." : "07",
        "ago." : "08",
        "sep." : "09",
        "oct." : "10",
        "nov." : "11",
        "dic." : "12",
    }
    const createTable = data => {
        const table = document.createElement('table');
        table.style.position = 'fixed';
        table.style.top = '-10000px';
        table.style.left = '-10000px';
        table.style.border = '1px solid black';
        table.style.textAlign = 'center';
        table.id = 'tableDeploy';
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        const [[mainDate]] = data;
        data.forEach(([tipo, ticket, app, title, user, priority, state, date]) => {
            const tr = document.createElement('tr');
            const tds = [tipo, ticket, app, title, user, priority, state, date].map(data => {
                const td = document.createElement('td');
                td.style.fontFamily = 'Arial';
                td.style.fontSize = '14px';
                td.innerHTML = data || mainDate;
                return td;
            });
            tds.forEach(td => tr.appendChild(td));
            // const [,,a, desc] = tr.children;
            // a.style.fontFamily = 'Inconsolata'; // (????????????
            // a.style.fontSize = '15px';
            // desc.style.textAlign = 'left';
            tbody.appendChild(tr);
        });
        document.body.appendChild(table);
    };

    const parseDate = (text) => {
        let date = text.split(" ");
        date = date[0] + "-" + meses[date[1]] + "-"+ date[2].replace(",","");
        return date;
    }

    const parseMain = () => {
        let state = $(".itemTitle:contains('Estado')").next().text();
        if (state == 'Solucionado'){
            state = 'Resuelto';
        }
        let tipo = $(".itemTitle:contains('Tipo')").next().text();
        let sigla = "";
        if (tipo == 'Pedido de servicio'){
            tipo = 'Solicitud InvGate';
            sigla = 'IGS-';
        } else if (tipo == 'Incidente') {
            tipo = 'Incidente InvGate';
            sigla = 'IGI-';
        } else if (tipo == 'Problema') {
            tipo = 'Problema InvGate';
            sigla = 'IGP-';
        }
        let numero = $(".requestViewId").text().replace('#', '');
        const ticket = sigla+numero;
        const title = $(".requestViewTitle").text();
        //const user = $(".boxModelListUsersUserRole:contains('Agente')").prev().find("a").text().toLowerCase().replace(' ', '.') + '.so';
        const user = equipo[$(".boxModelListUsersUserRole:contains('Agente')").prev().find("a").text()];
        const priority = $(".itemTitle:contains('Prioridad')").next().text();
        let date = $(".messageDate").find("span").attr("time-absolute");
        date = parseDate(date);
        let app = $(".requestViewSubtitle").text();
        app = app.split('  »  ');
        app = app.at(-1);
        return [tipo, ticket, app, title, user, priority, state, date];
    };

    const createCopy = () => {
        const a = document.createElement('button');
        a.href = '#';
        a.id = 'copiar';
        a.title = 'Copiar para planilla N2 o N3 - SIGET';
        a.accesskey = 'c';
        a.innerHTML = 'COPIAR N2/N3';
        a.addEventListener('click', copy);
        a.style.backgroundColor = '#4e81c6';
        a.style.color = 'white';
        a.style.border = '0px';
        a.style.cursor = 'pointer';
        $(".main-search-bar").append(a);
    };

    const copy = (e) => {
        const range = document.createRange();
        const table = document.querySelector('#tableDeploy');
        range.selectNode(table);
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);
        document.execCommand('copy');
        console.log("Campos copiados");
        document.querySelector('#copiar').innerHTML = 'Ticket copiado!';
        setTimeout(function(){ document.querySelector('#copiar').innerHTML = 'COPIAR N2/N3' }, 5000);
        e.currentTarget.blur();
        e.preventDefault();
    };
    createTable([parseMain()]);
    createCopy();

})();