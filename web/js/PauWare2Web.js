/** NON-BREAKING HYPHEN is '&#x2011;' */

const Lowest_animation_frequency = 500; // in milliseconds...

/* (1) DOM elements */
let verbose = null; // Set up in 'start()'
/* (2) SVG section */
let state_machine_name = null; // Set up in 'start()'
let svg_section = null; // Set up in 'start()'
let svg_section_text_items = null; // Set up in 'start()'
const prior_allowed_events = [];
const prior_exits = [];
const prior_disactivated_states = [];
const prior_activated_transitions = [];
const prior_entries = [];
const prior_dos = [];
const prior_true_invariants = [];
const prior_untrue_invariants = [];
/* (3) WebSockets */
let ws = null; // Set up in 'start()'
const WebSocketStateEvents = {
    error: function (event) {
        log("<font style='color: red;'>WebSockets error: " + event + "</font>");
    },
    open: function (event) {
        log("<font style='color: green;'>WebSockets connection is opening: " + JSON.stringify(event) + "</font>");
    },
    message: function (event) {
        try {
            // window.console.log(event.data.toString());
            const execution = JSON.parse(event.data);
            if (execution.hasOwnProperty("state_machine_name")) {
                window.console.assert(execution.state_machine_name === state_machine_name);
                log("<font style='color: blue;'>" + execution.verbose.replace(/\n\t/g, "<br>&nbsp;&nbsp;&nbsp;&nbsp;") + "</font>");
                const allowed_events = execution.allowed_events;
                const exits = execution.exits;
                const disactivated_states = execution.disactivated_states;
                const activated_transitions = execution.activated_transitions;
                const entries = execution.entries;
                const dos = execution.dos;
                const activated_states = execution.activated_states;
                const true_invariants = execution.true_invariants;
                const untrue_invariants = execution.untrue_invariants;
                let index;
                /* [3] For each text_item
                 =========================================================*/
                for (let i = 0; i < svg_section_text_items.length; i++) {
                    /* (1) If DisactivatedStates -> splice it
                     ---------------------------------------------------------*/
                    if (!!~(index = prior_disactivated_states.indexOf(svg_section_text_items[i]))) {
                        prior_disactivated_states.splice(index, 1);
                        svg_section_text_items[i].attr({fill: "black"});
                    }
                    /* (2) If Dos -> splice it
                     ---------------------------------------------------------*/
                    if (!!~(index = prior_dos.indexOf(svg_section_text_items[i]))) {
                        prior_dos.splice(index, 1);
                        svg_section_text_items[i].attr({fill: "black"});
                    }
                    /* (3) If TrueInvariants -> splice it
                     ---------------------------------------------------------*/
                    if (!!~(index = prior_true_invariants.indexOf(svg_section_text_items[i]))) {
                        prior_true_invariants.splice(index, 1);
                        svg_section_text_items[i].attr({fill: "black"});
                    }
                    /* (4) If UntrueInvariants -> splice it
                     ---------------------------------------------------------*/
                    if (!!~(index = prior_untrue_invariants.indexOf(svg_section_text_items[i]))) {
                        prior_untrue_invariants.splice(index, 1);
                        svg_section_text_items[i].attr({fill: "black", "text-decoration": "none"});
                    }
                    const text_item_id = svg_section_text_items[i].node.getAttribute("id");
                    /* (5) Only transition 'text' sections have 'id'
                     ---------------------------------------------------------*/
                    if (!!text_item_id) {
                        for (let j = 0; j < activated_transitions.length; j++) {
                            console.log("activ. transition " + j + " :" + activated_transitions[j]);
                            if (activated_transitions[j] === text_item_id) {
                                prior_activated_transitions[prior_activated_transitions.length] = svg_section_text_items[i];
                                svg_section_text_items[i].attr({fill: "blue"});
                                const animation = new Array();
                                for (let k = svg_section_text_items[i].node.textContent.length; k >= 0; k--) {
                                    animation.push(svg_section_text_items[i].node.textContent.substring(k));
                                }
                                Snap.animate(0, animation.length - 1, index => {
                                    svg_section_text_items[i].attr({
                                        text: animation[Math.floor(index)]
                                    });
                                }, Lowest_animation_frequency);
                            }
                        }
                    }
                    for (let j = 0; j < allowed_events.length; j++) {
                        if (allowed_events[j] === svg_section_text_items[i].node.textContent) {
                            prior_allowed_events[prior_allowed_events.length] = svg_section_text_items[i];
                            svg_section_text_items[i].attr({fill: "blue"});
                            const animation = new Array();
                            for (let k = svg_section_text_items[i].node.textContent.length; k >= 0; k--) {
                                animation.push(svg_section_text_items[i].node.textContent.substring(k));
                            }
                            Snap.animate(0, animation.length - 1, index => {
                                svg_section_text_items[i].attr({
                                    text: animation[Math.floor(index)]
                                });
                            }, Lowest_animation_frequency);
                        }
                    }
                    for (let j = 0; j < exits.length; j++) {
                        if (exits[j] === svg_section_text_items[i].node.textContent) {
                            prior_exits[prior_exits.length] = svg_section_text_items[i];
                            svg_section_text_items[i].attr({fill: "blue"});
                        }
                    }
                    for (let j = 0; j < disactivated_states.length; j++) {
                        if (disactivated_states[j] === svg_section_text_items[i].node.textContent) {
                            prior_disactivated_states[prior_disactivated_states.length] = svg_section_text_items[i];
                            svg_section_text_items[i].attr({fill: "lightblue"});
                        }
                    }
                    for (let j = 0; j < entries.length; j++) {
                        if (entries[j] === svg_section_text_items[i].node.textContent) {
                            prior_entries[prior_entries.length] = svg_section_text_items[i];
                            svg_section_text_items[i].attr({fill: "blue"});
                        }
                    }
                    for (let j = 0; j < dos.length; j++) {
                        if (dos[j] === svg_section_text_items[i].node.textContent) {
                            prior_dos[prior_dos.length] = svg_section_text_items[i];
                            svg_section_text_items[i].attr({fill: "blue"});
                        }
                    }
                    for (let j = 0; j < activated_states.length; j++) {
                        if (activated_states[j] === svg_section_text_items[i].node.textContent) {
                            svg_section_text_items[i].attr({fill: "blue"});
                            const animation = new Array();
                            for (let k = svg_section_text_items[i].node.textContent.length; k >= 0; k--) {
                                animation.push(svg_section_text_items[i].node.textContent.substring(k));
                            }
                            Snap.animate(0, animation.length - 1, index => {
                                svg_section_text_items[i].attr({
                                    text: animation[Math.floor(index)]
                                });
                            }, Lowest_animation_frequency);
                        }
                    }
                    for (let j = 0; j < true_invariants.length; j++) {
                        if (true_invariants[j] === svg_section_text_items[i].node.textContent) {
                            prior_true_invariants[prior_true_invariants.length] = svg_section_text_items[i];
                            svg_section_text_items[i].attr({fill: "green"});
                        }
                    }
                    for (let j = 0; j < untrue_invariants.length; j++) {
                        if (untrue_invariants[j] === svg_section_text_items[i].node.textContent) {
                            prior_untrue_invariants[prior_untrue_invariants.length] = svg_section_text_items[i];
                            svg_section_text_items[i].attr({fill: "red"/*, "text-decoration": "underline"*/});
                        }
                    }
                }
                if (execution.verbose.includes("***STOP***")) {
                    ws.close();
                }
            } else
                log("<font style='color: green;'>&nbsp;&nbsp;&nbsp;" + event.data.toString() + "</font>");
        } catch (error) {
            log("<font style='color: red;'>&nbsp;&nbsp;&nbsp;Parsing error: " + error.toString() + "</font>");
        }
    },
    // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    close: function (event /*: CloseEvent*/) {
        log("<font style='color: green;'>WebSockets connection is closing with code " + event.code + "&hellip;</font>");
    }
};
/* Log information */
function log(information) {
    verbose.innerHTML += information + "<br>";
    if (verbose.scrollHeight > verbose.clientHeight)
        verbose.scrollTop = verbose.scrollHeight - verbose.clientHeight;
}
/* Clear logged information */
function clear() {
    verbose.innerHTML = "";
    verbose.scrollTop = 0;
}
/* DOM just loaded... */
window.addEventListener("DOMContentLoaded", () => {
    verbose = window.document.getElementById('html_verbose');
    /* Deal with SVG section... */
    state_machine_name = window.document.getElementsByTagName('svg').item(0).getAttribute("id");
    svg_section = Snap('#' + state_machine_name);
    try {
        svg_section_text_items = svg_section.select("g").selectAll("text");
    } catch (error) {
        log("<font style='color: red;'>Error while getting SVG section: " + error.toString() + "</font>");
    }
    if (svg_section_text_items.length === 0)
        log("<font style='color: red;'>Error while getting SVG section: " + "no 'text' elements" + "</font>");
    /* (2) WebSockets */
    ws = window.WebSocket ? new window.WebSocket('ws://localhost:1963/PauWare2Web/' + state_machine_name + "?Web=true") : null;
    if (!ws) {
        log("<font style='color: red;'>WebSockets tech. is not supported in browser..." + "</font>");
        return;
    }
    ws.addEventListener('open', WebSocketStateEvents.open, false);
    ws.addEventListener('error', WebSocketStateEvents.error, false);
    ws.addEventListener('close', WebSocketStateEvents.close, false);
    ws.addEventListener('message', WebSocketStateEvents.message, false);
    /* Attach event handlers... */
    const FREQUENCY_SLIDER = window.document.getElementById('FREQUENCY_SLIDER');
    const FREQUENCY = window.document.getElementById('FREQUENCY');
    FREQUENCY_SLIDER.addEventListener('change', () => {
        FREQUENCY.value = FREQUENCY_SLIDER.value + ' sec.';
        ws.send(JSON.stringify({state_machine_name: state_machine_name, animation_frequency: parseFloat(FREQUENCY_SLIDER.value)}));
    }, false);

    const svg_width = window.document.getElementById(state_machine_name).style.width.slice(0, window.document.getElementById(state_machine_name).style.width.indexOf("px"));
    const svg_height = window.document.getElementById(state_machine_name).style.height.slice(0, window.document.getElementById(state_machine_name).style.width.indexOf("px"));
    const ZOOM_SLIDER = window.document.getElementById('ZOOM_SLIDER');
    const ZOOM = window.document.getElementById('ZOOM');
    ZOOM_SLIDER.addEventListener('change', () => {
        ZOOM.value = ZOOM_SLIDER.value + '%';
        // '<input id="ZOOM_SLIDER" type="range" min="5" max="100" step="5" value="100">'
        window.document.getElementById(state_machine_name).style.width = Math.floor(svg_width * ZOOM_SLIDER.value / 100) + "px";
        window.document.getElementById(state_machine_name).style.height = Math.floor(svg_height * ZOOM_SLIDER.value / 100) + "px";
    }, false);

    const pause = window.document.getElementById('pause');
    pause.addEventListener('click', () => {
        if (pause.getAttribute('src') === "./img/media-playback-pause-4.png") {
            pause.setAttribute('src', "./img/media-playback-start-4.png");
            ws.send(JSON.stringify({state_machine_name: state_machine_name, pause: true}));
        } else {
            window.console.assert(pause.getAttribute('src') === "./img/media-playback-start-4.png");
            pause.setAttribute('src', "./img/media-playback-pause-4.png");
            ws.send(JSON.stringify({state_machine_name: state_machine_name, pause: false}));
        }
    }, false);

    /* [3] 1 sec. routine
     =========================================================*/
    window.setInterval(() => {
        let index;
        /* For each text_item
         ---------------------------------------------------------*/
        for (let i = 0; i < svg_section_text_items.length; i++) {
            /* (1) If AllowedEvents -> splice it */
            if (!!~(index = prior_allowed_events.indexOf(svg_section_text_items[i]))) {
                prior_allowed_events.splice(index, 1);
                svg_section_text_items[i].attr({fill: "black"});
            }
            /* (2) If Exits -> splice it */
            if (!!~(index = prior_exits.indexOf(svg_section_text_items[i]))) {
                prior_exits.splice(index, 1);
                svg_section_text_items[i].attr({fill: "black"});
            }
            const text_item_id = svg_section_text_items[i].node.getAttribute("id");
            /* (3) Only transition 'text' sections have an 'id' */
            if (!!text_item_id) {
                /* (3.1) If Not PriorActivatedTransitions -> set it black */
                if (!~(index = prior_activated_transitions.indexOf(svg_section_text_items[i]))) {
                    svg_section_text_items[i].attr({fill: "black"});
                    /* (3.2) Else -> splice it */
                } else {
                    prior_activated_transitions.splice(prior_activated_transitions.indexOf(svg_section_text_items[i]), 1);
                    svg_section_text_items[i].attr({fill: "lightblue"});
                }
            }
            /* (4) If Entries -> splice it */
            if (!!~(index = prior_entries.indexOf(svg_section_text_items[i]))) {
                prior_entries.splice(index, 1);
                svg_section_text_items[i].attr({fill: "black"});
            }
        }
    }, Lowest_animation_frequency);
});