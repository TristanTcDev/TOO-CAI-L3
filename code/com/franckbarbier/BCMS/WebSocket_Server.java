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

        static {
            try {
                _bCMS = new BCMS();
                _bCMS.start();
            } catch (java.lang.Exception e) {
                e.printStackTrace();
            }
        }

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
                            _bCMS.PSC_connection_request();
                        }
                        break;
                    case "pompier":
                        System.out.println("Pompier");
                        if (_sessions.containsKey("Pompier")) {
                            javax.json.JsonObject error = javax.json.Json.createObjectBuilder().add("error", "already_exist").add("id", "pompier").build();
                            session.getBasicRemote().sendObject(error);
                        } else {
                            _sessions.put("Pompier", session.getId());
                            _bCMS.FSC_connection_request();
                        }
                        break;
                }
            }
            if (objarr.containsKey("function")) {
                switch (objarr.getString("function")) {
                    case "state_truck":
                        _bCMS.set_number_of_fire_truck_required(Integer.parseInt(objarr.getString("data")));
                        _bCMS.state_fire_truck_number(Integer.parseInt(objarr.getString("data")));
                        break;
                    case "state_car":
                        _bCMS.set_number_of_police_vehicle_required(Integer.parseInt(objarr.getString("data")));
                        _bCMS.state_police_vehicle_number(Integer.parseInt(objarr.getString("data")));
                        break;
                }
            }
            jsonReader.close();
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
    }
}
