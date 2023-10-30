import { useEffect } from "react";
import socket from "../SocketConnection";
import { HostPeerConnection } from "./PeerConnection";

export class HostConnections {
    playerConnections: HostPeerConnection[] = [];
}

// create global host connections object
const hostConnections = new HostConnections();

let number = 0;
let hostIntervalId: string | number | NodeJS.Timeout | null | undefined = null;

const onConnect = () => {
    console.log('connected to client');
}

const onData = (data: any) => {
    console.log(':::: Data from client', number++, data.toString());
}

const setupConnectionListeners = (connection: HostPeerConnection) => {
    console.log('setupConnectionListeners');
    connection.peerConnection.removeListener('connect', onConnect);
    connection.peerConnection.on('connect', onConnect);

    connection.peerConnection.removeListener('data', onData);
    connection.peerConnection.on('data', onData);

    const onClose = (connection) => {
        return () => {
            console.log('connection closed for client', connection.clientId);
            connection.peerConnection.destroy();
            hostConnections.playerConnections = hostConnections.playerConnections.filter(conn => conn.clientId !== connection.clientId);
            console.log('hostConnections after onClose', hostConnections);
        };
    };

    connection.peerConnection.removeListener('close', onClose);
    connection.peerConnection.on('close', onClose(connection));
}

const onSignalingData = (data: any, clientId: string) => {
    console.log('receiving signaling data from client', clientId);

    // Check if a connection already exists for the client
    let connection = hostConnections.playerConnections.find(conn => conn.clientId === clientId);

    // If no connection exists, create a new one
    if (!connection) {
        console.log('creating host connection for client', clientId);
        connection = new HostPeerConnection(clientId);
        hostConnections.playerConnections.push(connection);
        setupConnectionListeners(connection);
    }

    // Signal the connection with the received data
    connection.peerConnection.signal(data);
}


export const startListeningForHostConnections = () => {
    socket.on('signaling-data-to-host', onSignalingData);
}

let countsa = 0;
export const closeListeningForClientConnections = () => {
    socket.off('signaling-data-to-host', onSignalingData);
}

// every 5 seconds send test data to all clients
if (!hostIntervalId) {
    hostIntervalId = setInterval(() => {
        hostConnections.playerConnections.forEach((connection) => {
            console.log('sending test data to client', connection.clientId, '...');
            console.log('hostConnections', hostConnections);
            try {
                connection.peerConnection.send('hello from host: ' + countsa++);
            } catch (e) {
                console.log('error sending data to client', e);
            }
        });
    }, 5000);
}

// create react custom hook to listen for connections
export const useHostConnections = () => {
    useEffect(() => {
        startListeningForHostConnections();
        return () => {
            closeListeningForClientConnections();
        }
    }, []);
}
