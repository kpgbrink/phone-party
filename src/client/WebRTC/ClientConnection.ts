import socket from "../SocketConnection";
import { ClientPeerConnection } from "./PeerConnection";

export class ClientConnection {
    hostConnection: ClientPeerConnection | null = null;

    recreatePeerConnection() {
        // Clean up the existing connection before creating a new one
        if (this.hostConnection) {
            this.hostConnection.peerConnection.destroy();
            this.hostConnection = null;
        }
        // Create a new peer connection instance
        clientConnection.hostConnection = new ClientPeerConnection(clientConnection);
    }
}

const clientConnection = new ClientConnection();

export default clientConnection;

let number = 0;
let intervalId: string | number | NodeJS.Timeout | null | undefined = null;

export const onSignalingData = (data: any) => {
    if (clientConnection.hostConnection == null) {
        console.log('this is supposed to happen');
    }
    console.log('client dataaaaaaaaaa', data, 'clientConnection', clientConnection);
    //If the connection does not exist then create a new one
    if (!clientConnection.hostConnection) {
        clientConnection.hostConnection = new ClientPeerConnection(clientConnection);
    }

    clientConnection.hostConnection.peerConnection.signal(data);
    console.log('clientConnection to host is now', clientConnection);
}

// Initialize the interval to send test data every 2 seconds.
// Only one interval will be active at any point in time.
if (!intervalId) {
    intervalId = setInterval(() => {
        clientConnection?.hostConnection?.send(`Client data ${number++}`);
    }, 5000);
}

export const startListeningForClientConnections = () => {
    console.log('start listening for client connections');
    socket.on('signaling-data-to-client', onSignalingData);
}

export const closeListeningForClientConnections = () => {
    socket.off('signaling-data-to-client', onSignalingData);
}
