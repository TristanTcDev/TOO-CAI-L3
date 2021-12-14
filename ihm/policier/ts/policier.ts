const ws = new WebSocket('ws://localhost:1963/achaubet/BCMS'); //WebSocket coté client
let crisis_started: boolean = false;
let checkpomp: boolean = false;
let checkpol: boolean = false;
let myArrayOfThings = [
    {id: 1, name: 'Route 1'},
    {id: 2, name: 'Route 2'},
    {id: 3, name: 'Route 3'}
];
let myArrayOfThingsP = [
    {id: 1, name: 'Route 1'},
    {id: 2, name: 'Route 2'},
    {id: 3, name: 'Route 3'}
];
declare const Swal:any;


window.addEventListener('load', Main);
window.onload=function(){
    document.getElementById("idlePoli").style.display="none";
    document.getElementById("routePoli").style.display="none";
    document.getElementById("routePomp").style.display="none";
}

function Main(){
    ws.onmessage = function(e) {
        console.log("Bonjour, voici un message de Java: " + e.data); //On réceptionne le message du serveur (e.data)
        let data: string = e.data.toString();
        let dataObject = JSON.parse(data);
        if(dataObject.error==="already_exist") {
            console.log("plus de place disponible ");
            //document.getElementsByClassName("btnall")[0].remove();
            Swal.fire({
                icon: 'error',
                title: 'Alerte',
                allowOutsideClick: 'false',
                text: 'Un ' + dataObject.id + ' est deja connecté pour cette crise!',
            }).then((e) => {ws.close()}).then(() => {window.close();})
        }
        if(dataObject.state==="crisis_started"){
            crisis_started = true;
            Swal.close();
        }
        if(dataObject.status==="disagree_route"){
            console.log(dataObject.route);
            if ( myArrayOfThings.length > 1) {
                console.log(myArrayOfThings.length);
                let array = []
                myArrayOfThings.map(route =>{
                    if(route.id != Number.parseInt(dataObject.route)){
                        array.push(route);
                    }
                });
                myArrayOfThings = array;
                console.log(myArrayOfThings.length);
                console.log(myArrayOfThings);
                routePolicier();
            }
            else {
                if (checkpomp === false) {
                    toggle_buttonPom("routePomp", "Route des Pompiers");
                }
                Swal.fire({
                    icon: 'warning',
                    title: 'Problème de Route',
                    text: 'Plus aucune route n\'est disponble, une par défaut a était sélectionner !'
                })
            }
        }
        if(dataObject.status==="disagree_routeP"){
            console.log(dataObject.route);
            if ( myArrayOfThingsP.length > 1) {
                console.log(myArrayOfThingsP.length);
                myArrayOfThingsP.splice(Number.parseInt(dataObject.route)-1, 1);
                console.log(myArrayOfThingsP.length);
                routePompier();
            }
            else {
                if (checkpol === false) {
                    toggle_buttonPol("routePoli", "Route des Policiers");
                }
                Swal.fire({
                    icon: 'warning',
                    title: 'Problème de Route',
                    text: 'Plus aucune route n\'est disponble, une par défaut a était sélectionner !'
                })
            }
        }

        if(dataObject.status==="agree_route"){
            if (checkpomp === false) {
                toggle_buttonPom("routePomp", "Route des Pompiers");
            }
            Swal.fire(
                'Route validé!',
                'La route a était validé!',
                'success'
            )
        }

        if(dataObject.status==="agree_routeP"){
            if (checkpol === false) {
                toggle_buttonPol("routePoli", "Route des Policiers");
            }
            Swal.fire(
                'Route validé!',
                'La route a était validé!',
                'success'
            )
        }

    };
    ws.onopen = function() {
        ws.send(JSON.stringify({message: "Bonjour Java"})); //Envoie de ce message au serveur Java WebSocket (voir console NetBeans)
    };
    ws.onclose = function(e){
        console.log("Femeture du serveur Java WebSocket, code de fermeture: " + e.code); //On recupère le code d'extinction du serveur
    };
}

function btnPolicier(){
    console.log("Je suis un policier");
    ws.send(JSON.stringify({
        id: "policier",
    }));
    Swal.fire({
        title: 'En attente',
        html: 'Attente de la connexion du pompier',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading()
        },
    }).then(() => {
        toggle_button("policier", "Policier");
        document.getElementById("idlePoli").style.display = "block";
        document.getElementById("routePoli").style.display = "block";
        document.getElementById("routePomp").style.display = "block";
        ws.send(JSON.stringify({
            function: "police_connexion_request",
        }));
        Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Connecté à la crise',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
    })
}

function idlePolicier() {
    console.log("idle Policier fonctionne");
    Swal.fire({
        title: 'Choisissez le nombre de vehicules',
        icon: 'question',
        input: 'range',
        inputLabel: 'Nombre de voiture',
        inputAttributes:{
            min: 1,
            max: 10,
            step: 1
        },
        inputValue: 1
    }).then((nbVoitures) => {
        console.log(nbVoitures.value);
        ws.send(JSON.stringify({
            function: "state_car",
            data: nbVoitures.value
        }));
    })
}

function routePolicier() {
        let options = {};
        myArrayOfThings.map((o)=> {options[o.id] = o.name});
        Swal.fire({
        title: 'Choisissez la route à prendre',
        input: 'radio',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputOptions: options,
        inputValidator: (value) => {
            if (!value) {
                return 'Choisissez une route.'
            }
        }
    }).then((routePoli) => {
            checkpol = true;
            toggle_button("routePomp", "Route des Pompiers")
            toggle_button("routePoli", "Route des Policiers")
            console.log ("route policier fonctionne");
            ws.send(JSON.stringify({
                function: "routePolicier",
                data: routePoli.value
            }));
    });
}

function routePompier() {
    let options = {};
    myArrayOfThingsP.map((o)=> {options[o.id] = o.name});
    Swal.fire({
        title: 'Choisissez la route à prendre',
        input: 'radio',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputOptions: options,
        inputValidator: (value) => {
            if (!value) {
                return 'Choisissez une route.'
            }
        }
    }).then((routePomp) => {
        checkpomp = true;
        toggle_button("routePomp", "Route des Pompiers")
        toggle_button("routePoli", "Route des Policiers")
        console.log ("route pompier fonctionne");
        ws.send(JSON.stringify({
            function: "routePompier",
            data: routePomp.value
        }));
    });
}

function toggle_button ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = true;
    myButton.style.cursor = "not-allowed";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(122, 123, 137,1) 15%, rgb(73, 74, 83) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = texte;
}

function toggle_buttonPom ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = false;
    myButton.style.cursor = "pointer";
    myButton.style.background = "linear-gradient(90deg, rgba(36,0,0,1) 0%, rgba(200,6,6,1) 25%, rgba(200,6,6,1) 75%, rgba(36,0,0,1) 100%)";
    myButton.textContent = texte;
}

function toggle_buttonPol ( id: string, texte: string) {
    let myButton = <HTMLInputElement>document.getElementById(id);
    myButton.disabled = false;
    myButton.style.cursor = "pointer";
    myButton.style.background = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(15,26,102,1) 15%, rgba(15,26,102,1) 85%, rgba(0,0,0,1) 100%)";
    myButton.textContent = texte;
}