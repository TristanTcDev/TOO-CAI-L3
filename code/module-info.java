module BCMS {
    requires java.sql;
    requires PauWareTwo;
    requires javax.websocket.api;
    requires tyrus.server;
    requires java.desktop;
    opens com.franckbarbier.BCMS to PauWareTwo;
}
