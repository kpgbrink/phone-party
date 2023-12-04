import { useEffect } from "react";
import socket from "../SocketConnection";
import { HostPeerConnection } from "./PeerConnection";

export class HostConnections {
    playerConnections: HostPeerConnection[] = [];

    addConnection(connection: HostPeerConnection) {
        this.playerConnections.push(connection);
    }

    removeConnection(clientId: string) {
        const connection = this.playerConnections.find(conn => conn.clientId === clientId);
        if (connection) {
            connection.removeAllListeners();
        }
        this.playerConnections = this.playerConnections.filter(conn => conn.clientId !== clientId);
    }
}

// create global host connections object
export const hostConnections = new HostConnections();

const onSignalingData = (data: any, clientId: string) => {
    console.log('3132 Receiving signaling data from client', clientId);
    console.log('3132 hostConnections Before', hostConnections);

    // Use an IIFE to determine the connection and assign it to a constant
    const connection = (() => {
        let conn = hostConnections.playerConnections.find(conn => conn.clientId === clientId);

        if (!conn) {
            // No existing connection, create a new one
            console.log('3132 Creating a new host connection for client', clientId);
            conn = new HostPeerConnection(clientId, hostConnections);
            hostConnections.addConnection(conn);
        } else if (conn.peerConnection.destroyed) {
            // Existing connection found, but peer is destroyed
            console.log('3132 recreating peer connection');
            hostConnections.removeConnection(clientId);
            conn.peerConnection.destroy();
            conn = new HostPeerConnection(clientId, hostConnections);
            hostConnections.addConnection(conn);
        }
        return conn;
    })();

    // Process the signaling data with the connection
    connection.signal(data).catch((error) => {
        console.error(`3132 Error during signaling with client ${clientId}:`, error);
        // Handle any signaling errors here (e.g., cleanup if necessary)
    });

    console.log('3132 hostConnections After', hostConnections);
};


export const startListeningForHostConnections = () => {
    socket.on('signaling-data-to-host', onSignalingData);
}

// const countsa = 0;
export const closeListeningForHostConnections = () => {
    socket.off('signaling-data-to-host', onSignalingData);
}

// create react custom hook to listen for connections
export const useHostConnections = () => {
    useEffect(() => {
        startListeningForHostConnections();
        return () => {
            closeListeningForHostConnections();
        }
    }, []);
}
