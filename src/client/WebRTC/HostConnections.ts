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

    // Find the connection for the client ID, or create a new one if it doesn't exist
    let connection = hostConnections.playerConnections.find(conn => conn.clientId === clientId);

    if (!connection) {
        // No existing connection, create a new one
        console.log('3132 Creating a new host connection for client', clientId);
        connection = new HostPeerConnection(clientId, hostConnections);
        hostConnections.addConnection(connection);
    } else {
        // Existing connection found, handle the signaling data
        console.log('3132 Handling signaling data for existing connection', clientId);
        // recreate peer if it is destroyed
        if (connection.peerConnection.destroyed) {
            console.log('3132 recreating peer connection');
            // Clean up the existing connection before creating a new one
            if (connection) {
                connection.peerConnection.destroy();
            }
            // Create a new peer connection instance
            connection = new HostPeerConnection(clientId, hostConnections);
            hostConnections.addConnection(connection);
        }
    }

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
