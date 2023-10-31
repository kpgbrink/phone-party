import { useEffect } from "react";
import socket from "../SocketConnection";
import { HostPeerConnection } from "./PeerConnection";

export class HostConnections {
    playerConnections: HostPeerConnection[] = [];

    removeConnection(clientId: string) {
        this.playerConnections = this.playerConnections.filter(conn => conn.clientId !== clientId);
    }
}

// create global host connections object
const hostConnections = new HostConnections();

let hostIntervalId: string | number | NodeJS.Timeout | null | undefined = null;

const onSignalingData = (data: any, clientId: string) => {
    console.log('Receiving signaling data from client', clientId);

    // Find the connection for the client ID, or create a new one if it doesn't exist
    let connection = hostConnections.playerConnections.find(conn => conn.clientId === clientId);

    if (!connection) {
        // No existing connection, create a new one
        console.log('Creating a new host connection for client', clientId);
        connection = new HostPeerConnection(clientId, hostConnections);
        hostConnections.playerConnections.push(connection);
    } else {
        // Existing connection found, handle the signaling data
        console.log('Handling signaling data for existing connection', clientId);
    }

    // Process the signaling data with the connection
    connection.signal(data).catch((error) => {
        console.error(`Error during signaling with client ${clientId}:`, error);
        // Handle any signaling errors here (e.g., cleanup if necessary)
    });
};


export const startListeningForHostConnections = () => {
    socket.on('signaling-data-to-host', onSignalingData);
}

let countsa = 0;
export const closeListeningForHostConnections = () => {
    socket.off('signaling-data-to-host', onSignalingData);
}

// every 5 seconds send test data to all clients
if (!hostIntervalId) {
    hostIntervalId = setInterval(() => {
        hostConnections.playerConnections.forEach((connection) => {
            console.log('sending test data to client', connection.clientId, '...');
            console.log('hostConnections', hostConnections);
            connection.send(`Host data ${countsa++}`);
        });
    }, 5000);
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
