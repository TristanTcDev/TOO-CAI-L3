/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.franckbarbier.BCMS;

import java.math.BigDecimal;

/**
 *
 * @author arnaud
 */
public class WebSocket_Server {

    private static java.util.concurrent.CountDownLatch latch;

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
                        }
                        break;
                    case "pompier":
                        System.out.println("Pompier");
                        if (_sessions.containsKey("Pompier")) {
                            javax.json.JsonObject error = javax.json.Json.createObjectBuilder().add("error", "already_exist").add("id", "pompier").build();
                            session.getBasicRemote().sendObject(error);
                        } else {
                            _sessions.put("Pompier", session.getId());
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
                        javax.json.JsonObject pompier_truck_ok = javax.json.Json.createObjectBuilder().add("status", "fireman_truck_ok").build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Policier"))) {
                                usr.getBasicRemote().sendObject(pompier_truck_ok);
                            }
                        }
                        break;
                    case "state_car":
                        _bCMS.set_number_of_police_vehicle_required(Integer.parseInt(objarr.getString("data")));
                        _bCMS.state_police_vehicle_number(Integer.parseInt(objarr.getString("data")));
                        javax.json.JsonObject policier_car_ok = javax.json.Json.createObjectBuilder().add("status", "policier_car_ok").build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Pompier"))) {
                                usr.getBasicRemote().sendObject(policier_car_ok);
                            }
                        }
                        break;
                    case "routePolicier":
                        _bCMS.route_for_police_vehicles();
                        javax.json.JsonObject route = javax.json.Json.createObjectBuilder().add("status", "valid_route").add("route", objarr.getString("data")).build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Pompier"))) {
                                usr.getBasicRemote().sendObject(route);
                            }
                        }
                        break;
                    case "routePompier":
                        _bCMS.route_for_fire_trucks();
                        javax.json.JsonObject routeP = javax.json.Json.createObjectBuilder().add("status", "valid_routeP").add("route", objarr.getString("data")).build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Pompier"))) {
                                usr.getBasicRemote().sendObject(routeP);
                            }
                        }
                        break;
                    case "disagree_route_policier":
                        _bCMS.FSC_disagrees_about_police_vehicle_route();
                        javax.json.JsonObject route_disagree = javax.json.Json.createObjectBuilder().add("status", "disagree_route").add("route", objarr.getString("data")).build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Policier"))) {
                                usr.getBasicRemote().sendObject(route_disagree);
                            }
                        }
                        break;
                    case "disagree_route_pompier":
                        _bCMS.FSC_disagrees_about_fire_truck_route();
                        javax.json.JsonObject route_disagreeP = javax.json.Json.createObjectBuilder().add("status", "disagree_routeP").add("route", objarr.getString("data")).build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Policier"))) {
                                usr.getBasicRemote().sendObject(route_disagreeP);
                            }
                        }
                        break;
                    case "agree_route_policier":
                        _bCMS.FSC_agrees_about_police_vehicle_route();
                        javax.json.JsonObject route_agree = javax.json.Json.createObjectBuilder().add("status", "agree_route").add("route", objarr.getString("data")).build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Policier"))) {
                                usr.getBasicRemote().sendObject(route_agree);
                            }
                        }
                        break;
                    case "agree_route_pompier":
                        _bCMS.FSC_agrees_about_fire_truck_route();
                        javax.json.JsonObject route_agreeP = javax.json.Json.createObjectBuilder().add("status", "agree_routeP").add("route", objarr.getString("data")).build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Policier"))) {
                                usr.getBasicRemote().sendObject(route_agreeP);
                            }
                        }
                        break;
                    case "shutdown":
                        _bCMS.close();
                        _bCMS.stop();
                        for (javax.websocket.Session usr : sessions) {
                            usr.close();
                        }
                        latch.countDown();
                        break;
                    case "dispatch_truck_fireman":
                        _bCMS.fire_truck_dispatched("Fire truck #" + objarr.getString("data"));
                        for (String s : _bCMS.get_fire_trucks(BCMS.Status.Dispatched)) {
                            System.out.println(BCMS.Status.Dispatched + ": " + s);
                        }
                        break;
                    case "dispatch_car_police":
                        _bCMS.police_vehicle_dispatched("Police vehicle #" + objarr.getString("data"));
                        for (String s : _bCMS.get_fire_trucks(BCMS.Status.Dispatched)) {
                            System.out.println(BCMS.Status.Dispatched + ": " + s);
                        }
                        break;
                    case "arrived_truck_fireman":
                        _bCMS.fire_truck_arrived("Fire truck #" + objarr.getString("data"));
                        for (String s : _bCMS.get_fire_trucks(BCMS.Status.Dispatched)) {
                            System.out.println(BCMS.Status.Dispatched + ": " + s);
                        }
                        break;
                    case "arrived_car_police":
                        _bCMS.police_vehicle_arrived("Police vehicle #" + objarr.getString("data"));
                        for (String s : _bCMS.get_fire_trucks(BCMS.Status.Dispatched)) {
                            System.out.println(BCMS.Status.Dispatched + ": " + s);
                        }
                        break;
                    case "route_poli_choisis":
                        javax.json.JsonObject routepolichoisis = javax.json.Json.createObjectBuilder().add("status", "route_policier_choisis").build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Pompier"))) {
                                usr.getBasicRemote().sendObject(routepolichoisis);
                            }
                        }
                        break;
                    case "all_police_car_arrived":
                        javax.json.JsonObject all_police_car_arrived = javax.json.Json.createObjectBuilder().add("status", "all_police_car_arrived").build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Pompier"))) {
                                usr.getBasicRemote().sendObject(all_police_car_arrived);
                            }
                        }
                        break;
                    case "all_fireman_truck_arrived":
                        javax.json.JsonObject all_fireman_truck_arrived = javax.json.Json.createObjectBuilder().add("status", "all_fireman_truck_arrived").build();
                        for (javax.websocket.Session usr : sessions) {
                            if (usr.getId().equals(_sessions.get("Policier"))) {
                                usr.getBasicRemote().sendObject(all_fireman_truck_arrived);
                            }
                        }
                        break;
                }

            }
            jsonReader.close();
            if (_sessions.size() == 2 && _bCMS == null) {
                _crisis_start(session);
            }
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
            java.util.Map<String, Object> user_properties = new java.util.TreeMap<>();
            user_properties.put("Author", "Tristan and Arnaud");
            org.glassfish.tyrus.server.Server server = new org.glassfish.tyrus.server.Server("localhost", 1963, "/BCMS_Server", user_properties, WebSocket_Server.My_ServerEndpoint.class); //Paramètres du serveur : nom de domaine, port, dossier dans l'url, propriétés utilisateur, classe contenant ServerEndPoint pour communiquer avec JavaScript.
            server.start(); //Démarrage du serveur WebSocket
            java.awt.Desktop.getDesktop().browse(java.nio.file.FileSystems.getDefault().getPath("ihm" + java.io.File.separatorChar + "pompier" + java.io.File.separatorChar + "pompier.html").toUri()); //Ouvre le index.html dans une nouvelle fenètre du naviagteur par défaut.
            java.awt.Desktop.getDesktop().browse(java.nio.file.FileSystems.getDefault().getPath("ihm" + java.io.File.separatorChar + "policier" + java.io.File.separatorChar + "policier.html").toUri()); //Ouvre le index.html dans une nouvelle fenètre du naviagteur par défaut.
            latch = new java.util.concurrent.CountDownLatch(1);
            latch.await();
            server.stop();
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }
}
