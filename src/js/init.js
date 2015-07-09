"use strict";



/* ----------------------- *
 * --- Security ---------- *
 * ----------------------- */

    window.addEventListener("dragover", function (e) {
        e.preventDefault();
    }, false);

    window.addEventListener("drop", function (e) {
        e.preventDefault();
    }, false);



/* ----------------------- *
 * --- Default View ------ *
 * ----------------------- */

    var Instance = React.render(
        React.createElement(Museeks, null),
        document.getElementById('wrap')
    );
