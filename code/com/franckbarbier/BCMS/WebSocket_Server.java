/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.franckbarbier.BCMS;

/**
 *
 * @author arnaud
 */
public class WebSocket_Server {

    @javax.websocket.server.ServerEndpoint(value = "/BCMS")
    public static class My_ServerEndpoint {

        private static java.util.Map<String, String> _sessions = new java.util.HashMap<>(); // Key: Policier or Pompier, Value: sessionId
        private static BCMS _bCMS = null;

        @javax.websocket.OnClose
        public void onClose(javax.websocket.Session session, javax.websocket.CloseReason close_reason) {
            System.out.println("onClose: " + close_reason.getReasonPhrase());
        }

        @javax.websocket.OnError
        public void onError(javax.websocket.Session session, Throwable throwable) {
            System.out.println("onError: " + throwable.getMessage());
        }

        @javax.websocket.OnMessage
        public void onMessage(javax.websocket.Session session, String message) throws java.lang.Exception {
            java.util.Set<javax.websocket.Session> sessions = session.getOpenSessions();
            javax.json.JsonReader jsonReader = javax.json.Json.createReader(new java.io.StringReader(message));
            System.out.println("Message de JavaScript: " + message);
            javax.json.JsonObject objarr = jsonReader.readObject();
            if (objarr.containsKey("id")) {
                switch (objarr.getString("id")) {
                    case "policier":
                        System.out.println("Policier");
                        if (_sessions.containsKey("Policier")) {
                            javax.json.JsonObject error = javax.json.Json.createObjectBuilder().add("error", "already_exist").add("id", "policier").build();
                            session.getBasicRemote().sendObject(error);
                        } else {
                            _sessions.put("Policier", session.getId());
                            //_bCMS.PSC_connection_request();
                        }
                        break;
                    case "pompier":
                        System.out.println("Pompier");
                        if (_sessions.containsKey("Pompier")) {
                            javax.json.JsonObject error = javax.json.Json.createObjectBuilder().add("error", "already_exist").add("id", "pompier").build();
                            session.getBasicRemote().sendObject(error);
                        } else {
                            _sessions.put("Pompier", session.getId());
                            //_bCMS.FSC_connection_request();
                        }
                        break;
                }
            }
            if (objarr.containsKey("function")) {
                switch (objarr.getString("function")) {
                    case "police_connexion_request":
                        _bCMS.PSC_connection_request();
                        break;
                    case "pompier_connexion_request":
                        _bCMS.FSC_connection_request();
                        break;
                    case "state_truck":
                        _bCMS.set_number_of_fire_truck_required(Integer.parseInt(objarr.getString("data")));
                        _bCMS.state_fire_truck_number(Integer.parseInt(objarr.getString("data")));
                        break;
                    case "state_car":
                        _bCMS.set_number_of_police_vehicle_required(Integer.parseInt(objarr.getString("data")));
                        _bCMS.state_police_vehicle_number(Integer.parseInt(objarr.getString("data")));
                        break;
                    case "routePolicier":
                        System.out.println("Route Policier");
                        _bCMS.route_for_police_vehicles();
                        javax.json.JsonObject route = javax.json.Json.createObjectBuilder().add("status", "valid_route").add("route", objarr.getString("data")).build();
                        for (javax.websocket.Session usr : sessions) {
                            if(usr.getId().equals(_sessions.get("Pompier"))){
                                usr.getBasicRemote().sendObject(route);
                            }
                        }
                        break;
                }
            }
            jsonReader.close();
            if (_sessions.size() == 2 && _bCMS == null) {
                _crisis_start(session);
            }
            //System.out.println(_bCMS._BCMS_state_machine.current_state());
            //java.util.Set<javax.websocket.Session> sessions = session.getOpenSessions();
            //System.out.println("Sessions ouvertes: " + sessions.size());
        }

        @javax.websocket.OnOpen
        public void onOpen(javax.websocket.Session session, javax.websocket.EndpointConfig ec) throws java.io.IOException, java.lang.Exception {
            System.out.println("OnOpen... " + ec.getUserProperties().get("Author"));
            javax.json.JsonObject openMessage = javax.json.Json.createObjectBuilder().add("handshaking", "yes").add("message", "Connecté avec succès à Java").build();
            session.getBasicRemote().sendObject(openMessage);
        }

        private void _crisis_start(javax.websocket.Session session) throws java.io.IOException, java.lang.Exception {
            java.util.Set<javax.websocket.Session> sessions = session.getOpenSessions();
            try {
                _bCMS = new BCMS();
                _bCMS.start();
            } catch (java.lang.Exception e) {
                for (javax.websocket.Session usr : sessions) {
                    javax.json.JsonObject error = javax.json.Json.createObjectBuilder().add("error", "error_bcms_start").build();
                    usr.getBasicRemote().sendObject(error);
                }
                e.printStackTrace();
            }
            for (javax.websocket.Session usr : sessions) {
                javax.json.JsonObject error = javax.json.Json.createObjectBuilder().add("state", "crisis_started").build();
                usr.getBasicRemote().sendObject(error);
            }
        }
    }

    public static void main(String args[]) {

        try {
            java.util.Map<String, Object> user_properties = new java.util.TreeMap<>(); // Dictionnaire contenant les paramètres utilisateurs (ne fonctionne pas, a besoin d'investigations...)
            user_properties.put("Author", "Tristan and Arnaud");
            org.glassfish.tyrus.server.Server server = new org.glassfish.tyrus.server.Server("localhost", 1963, "/achaubet", user_properties, WebSocket_Server.My_ServerEndpoint.class); //Paramètres du serveur : nom de domaine, port, dossier dans l'url, propriétés utilisateur, classe contenant ServerEndPoint pour communiquer avec JavaScript.
            server.start(); //Démarrage du serveur WebSocket
            java.awt.Desktop.getDesktop().browse(java.nio.file.FileSystems.getDefault().getPath("ihm" + java.io.File.separatorChar + "pompier" + java.io.File.separatorChar + "pompier.html").toUri()); //Ouvre le index.html dans une nouvelle fenètre du naviagteur par défaut.
            java.awt.Desktop.getDesktop().browse(java.nio.file.FileSystems.getDefault().getPath("ihm" + java.io.File.separatorChar + "policier" + java.io.File.separatorChar + "policier.html").toUri()); //Ouvre le index.html dans une nouvelle fenètre du naviagteur par défaut.
            //Serveur de ws et BCMS dans classe differente
            //Je prends le message et j'appelle la bonne fonction

            //On peut utiliser la méthode .current_state(); pour checker l'etat de la crise
            System.out.println("\n*** Please press any key to stop the server... ***\n");
            System.in.read(); // Bloque le serveur dans l'attente d'un appuie sur une touche.

            server.stop();

            /*BCMS bCMS = new BCMS();
            bCMS.start();
            bCMS.FSC_connection_request();
            bCMS.PSC_connection_request();
            bCMS.state_fire_truck_number(2);
            bCMS.state_police_vehicle_number(2);

            for (String s : bCMS.get_fire_trucks()) {
                System.out.println("Idle: " + s);
            }

            bCMS.route_for_police_vehicles();
            bCMS.route_for_fire_trucks();
            bCMS.FSC_disagrees_about_fire_truck_route();
            bCMS.route_for_fire_trucks();
            bCMS.FSC_agrees_about_police_vehicle_route();
            bCMS.FSC_agrees_about_fire_truck_route();

            bCMS.fire_truck_dispatched("Fire truck #1");
            Thread.sleep(10);
            bCMS.fire_truck_dispatched("Fire truck #2");
            Thread.sleep(10);
            for (String s : bCMS.get_fire_trucks(Status.Dispatched)) {
                System.out.println(Status.Dispatched + ": " + s);
            }

            bCMS.police_vehicle_dispatched("Police vehicle #1");
            Thread.sleep(10);
            bCMS.police_vehicle_dispatched("Police vehicle #2");
            Thread.sleep(10);
            for (String s : bCMS.get_police_vehicles(Status.Dispatched)) {
                System.out.println(Status.Dispatched + ": " + s);
            }

            bCMS.police_vehicle_breakdown("Police vehicle #1", "");
            for (String s : bCMS.get_police_vehicles(Status.Breakdown)) {
                System.out.println(Status.Breakdown + ": " + s);
            }

            bCMS.fire_truck_arrived("Fire truck #1");
            Thread.sleep(10);
            bCMS.fire_truck_arrived("Fire truck #2");
            Thread.sleep(10);
            for (String s : bCMS.get_fire_trucks(Status.Dispatched)) {
                System.out.println(Status.Dispatched + ": " + s);
            }
            for (String s : bCMS.get_fire_trucks(Status.Arrived)) {
                System.out.println(Status.Arrived + ": " + s);
            }

            bCMS.police_vehicle_arrived("Police vehicle #2");
            Thread.sleep(10);
            for (String s : bCMS.get_police_vehicles(Status.Dispatched)) {
                System.out.println(Status.Dispatched + ": " + s);
            }
            for (String s : bCMS.get_police_vehicles(Status.Arrived)) {
                System.out.println(Status.Arrived + ": " + s);
            }
            bCMS.close();
            bCMS.stop();*/
//            bCMS = new BCMS();
//            bCMS.start();
//
//            Thread.sleep(10);
//            bCMS.FSC_connection_request();
//            bCMS.PSC_connection_request();
//            bCMS.state_fire_truck_number(3);
//            bCMS.state_police_vehicle_number(2);
//
//            bCMS.route_for_police_vehicles();
//            bCMS.route_for_fire_trucks();
//            bCMS.FSC_agrees_about_police_vehicle_route();
//            bCMS.FSC_agrees_about_fire_truck_route();
//
//            bCMS.fire_truck_dispatched("Fire truck #1");
//            Thread.sleep(10);
//            bCMS.fire_truck_dispatched("Fire truck #2");
//            Thread.sleep(10);
//            bCMS.fire_truck_dispatched("Fire truck #3");
//            Thread.sleep(10);
//            bCMS.police_vehicle_dispatched("Police vehicle #2");
//            Thread.sleep(10);
//            bCMS.police_vehicle_dispatched("Police vehicle #1");
//            Thread.sleep(10);
//            bCMS.fire_truck_breakdown("Fire truck #1", "Fire truck #4");
//            Thread.sleep(10);
//            for (String s : bCMS.get_fire_trucks(Status.Dispatched)) {
//                System.out.println(Status.Dispatched + ": " + s);
//            }
//
//            bCMS.fire_truck_arrived("Fire truck #4");
//            Thread.sleep(10);
//            bCMS.fire_truck_arrived("Fire truck #3");
//            Thread.sleep(10);
//            bCMS.fire_truck_arrived("Fire truck #2");
//            Thread.sleep(10);
//            bCMS.fire_truck_arrived("Fire truck #1"); // No effect!
//            Thread.sleep(10);
//            for (String s : bCMS.get_fire_trucks(Status.Arrived)) {
//                System.out.println(Status.Arrived + ": " + s);
//            }
//            bCMS.police_vehicle_arrived("Police vehicle #1");
//            Thread.sleep(10);
//            bCMS.crisis_is_less_severe();
//            Thread.sleep(10);
//            for (String s : bCMS.get_police_vehicles(Status.Dispatched)) {
//                System.out.println(Status.Dispatched + ": " + s);
//            }
//            for (String s : bCMS.get_police_vehicles(Status.Arrived)) {
//                System.out.println(Status.Arrived + ": " + s);
//            }
//            bCMS.police_vehicle_arrived("Police vehicle #2"); // No effect!
//            Thread.sleep(10);
//            bCMS.close();
//            bCMS.stop();
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }
}
