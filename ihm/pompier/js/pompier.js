var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const ws = new WebSocket('ws://localhost:1963/BCMS_Server/BCMS'); //WebSocket coté client
let crisis_started = false;
let policier_car_ok = false;
let all_police_car_arrived = false;
let nbTruck;
let leftdis = 10;
let checkarrive = 0;
window.addEventListener('load', Main);
window.onload = function () {
    document.getElementById("idlePomp").style.display = "none";
    document.getElementById("accorderCrisePomp").style.display = "none";
    document.getElementById("accorderCrisePolPomp").style.display = "none";
    document.getElementById("ShutdownServ").style.display = "none";
};
function Main() {
    ws.onmessage = function (e) {
        console.log("Bonjour, voici un message de Java: " + e.data); //On réceptionne le message du serveur (e.data)
        let data = e.data.toString();
        let dataObject = JSON.parse(data);
        if (dataObject.error === "already_exist") {
            console.log("plus de place disponible ");
            //document.getElementsByClassName("btnall")[0].remove();
            Swal.fire({
                icon: 'error',
                title: 'Alerte',
                text: 'Un ' + dataObject.id + ' est deja connecté pour cette crise!',
            }).then((e) => { ws.close(); }).then(() => { window.close(); });
        }
        if (dataObject.state === "crisis_started") {
            crisis_started = true;
            Swal.close();
        }
        if (dataObject.status === "valid_routeP") {
            Swal.fire({
                title: 'Les pompiers veulent prendre la route ' + dataObject.route,
                showDenyButton: true,
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: 'Route confirmer',
                denyButtonText: `Route non confirmer`,
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    Swal.fire('Route confirmer!', '', 'success');
                    ws.send(JSON.stringify({
                        function: "agree_route_pompier",
                        data: dataObject.route
                    }));
                }
                else if (result.isDenied) {
                    Swal.fire('Route non confirmer', '', 'error');
                    ws.send(JSON.stringify({
                        function: "disagree_route_pompier",
                        data: dataObject.route
                    }));
                }
            });
            return 0;
        }
        if (dataObject.status === "valid_route") {
            Swal.fire({
                title: 'Les policiers veulent prendre la route ' + dataObject.route,
                showDenyButton: true,
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: 'Route confirmer',
                denyButtonText: `Route non confirmer`,
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire('Route confirmer!', '', 'success');
                    ws.send(JSON.stringify({
                        function: "agree_route_policier",
                        data: dataObject.route
                    }));
                }
                else if (result.isDenied) {
                    Swal.fire('Route non confirmer', '', 'error');
                    ws.send(JSON.stringify({
                        function: "disagree_route_policier",
                        data: dataObject.route
                    }));
                }
            });
            return 0;
        }
        if (dataObject.status === "route_pompiers_choisis") {
            for (let i = 1; i <= nbTruck; i++) {
                buttonNbPompier(i);
            }
        }
        if (dataObject.status === "policier_car_ok") {
            Swal.close();
            policier_car_ok = true;
        }
        if (dataObject.status === "all_police_car_arrived") {
            Swal.close();
            all_police_car_arrived = true;
        }
    };
    ws.onopen = function () {
        ws.send(JSON.stringify({ message: "Bonjour Java" })); //Envoie de ce message au serveur Java WebSocket (voir console NetBeans)
    };
    ws.onclose = function (e) {
        console.log("Femeture du serveur Java WebSocket, code de fermeture: " + e.code); //On recupère le code d'extinction du serveur
    };
}
function btnPompier() {
    console.log("Je suis un pompier");
    ws.send(JSON.stringify({
        id: "pompier",
    }));
    Swal.fire({
        title: 'En attente',
        html: 'Attente de la connexion du policier',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    }).then(() => {
        toggle_button("pompier", "Pompier");
        document.getElementById("idlePomp").style.display = "block";
        document.getElementById("ShutdownServ").style.display = "block";
        ws.send(JSON.stringify({
            function: "pompier_connexion_request",
        }));
        Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Connecté à la crise',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    });
}
function idlePompier() {
    console.log("idle pompier fonctionne");
    Swal.fire({
        title: 'Choisissez le nombre de vehicules',
        icon: 'question',
        input: 'range',
        inputLabel: 'Nombre de camions',
        inputAttributes: {
            min: 1,
            max: 10,
            step: 1
        },
        inputValue: 1
    }).then((nbCamions) => {
        nbTruck = nbCamions.value;
        toggle_button("idlePomp", nbCamions.value + "  véhicule disponible");
        console.log(nbCamions.value);
        ws.send(JSON.stringify({
            function: "state_truck",
            data: nbCamions.value
        }));
        if (!policier_car_ok) {
            Swal.fire({
                title: 'En attente',
                html: 'Attente de l\'envoie des véhicule des Policiers',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            }).then(() => {
                ws.send(JSON.stringify({
                    function: "pompier_truck_request",
                }));
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: 'Les policiers ont envoyer le véhicule',
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });
            });
        }
        document.getElementById("updcrise").textContent = "Crise pris en compte";
        document.getElementById("CriseBCMS").style.backgroundColor = "#FF8C00";
    });
}
function buttonNbPompier(e) {
    let x = document.createElement("button");
    x.id = ("button_dispatched" + e);
    x.className = "button_dispatched";
    document.body.appendChild(x);
    document.getElementById(x.id).onclick = function () { dispaffi(x.id); };
    let myButton = document.getElementById(x.id);
    console.log(myButton.id);
    myButton.textContent = "Dispatcher #" + e;
    myButton.style.alignItems = "center";
    myButton.style.color = "white";
    myButton.style.fontWeight = "bold";
    myButton.style.top = "55%";
    myButton.style.left = leftdis + "%";
    myButton.style.width = "5%";
    myButton.style.height = "4%";
    myButton.style.position = "absolute";
    myButton.style.background = "linear-gradient(90deg, rgba(36,0,0,1) 0%, rgba(200,6,6,1) 25%, rgba(200,6,6,1) 75%, rgba(36,0,0,1) 100%)";
    myButton.style.border = "1";
    myButton.style.borderRadius = "8px";
    myButton.style.boxShadow = "rgba(151, 65, 252, 0.2) 0 15px 30px -5px";
    myButton.style.boxSizing = "border-box";
    myButton.style.fontFamily = "Phantomsans, sans-serif";
    myButton.style.fontSize = "15px";
    myButton.style.justifyContent = "center";
    myButton.style.padding = "3px";
    myButton.style.cursor = "pointer";
    let y = document.createElement("button");
    y.id = ("button_arrive" + e);
    y.className = "button_arrive";
    document.body.appendChild(y);
    document.getElementById(y.id).onclick = function () { vireraffi(y.id); };
    let myButtonAri = document.getElementById(y.id);
    console.log(myButtonAri);
    myButtonAri.style.display = "none";
    myButtonAri.textContent = "Arrivé #" + e;
    myButtonAri.style.alignItems = "center";
    myButtonAri.style.color = "white";
    myButtonAri.style.fontWeight = "bold";
    myButtonAri.style.top = "70%";
    myButtonAri.style.left = leftdis + "%";
    myButtonAri.style.width = "5%";
    myButtonAri.style.height = "4%";
    myButtonAri.style.position = "absolute";
    myButtonAri.style.background = "linear-gradient(90deg, rgba(36,0,0,1) 0%, rgba(200,6,6,1) 25%, rgba(200,6,6,1) 75%, rgba(36,0,0,1) 100%)";
    myButtonAri.style.border = "1";
    myButtonAri.style.borderRadius = "8px";
    myButtonAri.style.boxShadow = "rgba(151, 65, 252, 0.2) 0 15px 30px -5px";
    myButtonAri.style.boxSizing = "border-box";
    myButtonAri.style.fontFamily = "Phantomsans, sans-serif";
    myButtonAri.style.fontSize = "15px";
    myButtonAri.style.justifyContent = "center";
    myButtonAri.style.padding = "3px";
    myButtonAri.style.cursor = "pointer";
    leftdis += 7;
    document.getElementById("updcrise").textContent = "Crise entraind d\'être résolus";
    document.getElementById("CriseBCMS").style.backgroundColor = "#FFFF00";
}
function dispaffi(id) {
    let a = id.slice(-1);
    toggle_button(id, "Vehicule Dispatcher");
    let myButton = document.getElementById("button_arrive" + a);
    myButton.style.display = "block";
    toggle_buttonPom("button_arrive" + a, "Arrivé #" + a);
    ws.send(JSON.stringify({
        function: "dispatchPompier",
        data: a,
    }));
}
function vireraffi(id) {
    toggle_button(id, "Vehicule arrivé");
    checkarrive += 1;
    console.log(checkarrive);
    if (checkarrive >= nbTruck) {
        ws.send(JSON.stringify({
            function: "all_fireman_truck_arrived"
        }));
        if (!all_police_car_arrived) {
            Swal.fire({
                title: 'En attente',
                html: 'Attente de l\'arrivée de tous les véhicules des Policiers',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
        }
        document.getElementById("updcrise").textContent = "Crise résolus";
        document.getElementById("CriseBCMS").style.backgroundColor = "#32CD32";
    }
}
function ShutdownServeur() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Shutdown marche");
        ws.send(JSON.stringify({
            function: "shutdown"
        }));
        Swal.fire('Le serveur a été fermé, la fenetre va se fermer dans 5 secondes');
        yield sleep(5000);
        window.close();
    });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function toggle_button(id, texte) {
    let myButton = document.getElementById(id);
    myButton.disabled = true;
    myButton.style.cursor = "not-allowed";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(122, 123, 137,1) 15%, rgb(73, 74, 83) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = texte;
}
function toggle_buttonPom(id, texte) {
    let myButton = document.getElementById(id);
    myButton.disabled = false;
    myButton.style.cursor = "pointer";
    myButton.style.background = "linear-gradient(90deg, rgba(36,0,0,1) 0%, rgba(200,6,6,1) 25%, rgba(200,6,6,1) 75%, rgba(36,0,0,1) 100%)";
    myButton.textContent = texte;
}
//# sourceMappingURL=pompier.js.map