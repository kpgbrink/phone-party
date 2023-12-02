import { GameData, PlayerData } from "../../../../shared/data/Data";
import socket from "../../../SocketConnection";
import { hostConnections } from "../../../WebRTC/HostConnections";
import { HostPeerConnection } from "../../../WebRTC/PeerConnection";

export abstract class HostDataHandlerBase<PlayerDataType extends PlayerData, GameDataType extends GameData> {

    create() {
        this.listenForGameData();
        this.listenForPlayerData();
        this.listenForData();

        this.socketListenForGetUserStateRequest();
        this.socketListenForGetGameStateRequest();
        this.socketListenForGetDataRequest();

        this.initializeDataListenersForExistingConnections();
    }

    destroy() {
        socket.removeListener("playerDataToHost");
        socket.removeListener("gameDataToHost");
        socket.removeListener("dataToHost");
        socket.removeListener("getPlayerData");
        socket.removeListener("getGameData");
        socket.removeListener("getData");
    }

    // WEBRTC --------------------
    // HostConnections --------------------
    initializeDataListenersForExistingConnections() {
        // Set up listeners for existing connections
        hostConnections.playerConnections.forEach(connection => {
            this.setupDataListener(connection);
        });
    }

    setupDataListener(connection: HostPeerConnection) {
        console.log('setting up data listener for', connection.clientId);
        const dataHandler = (data: any) => {
            try {
                const parsedData = JSON.parse(data);
                console.log('received data via WebRTC:', parsedData);
                switch (parsedData.type) {
                    case 'playerData': {
                        this.onPlayerDataReceived(connection.clientId, parsedData.data, null);
                        break;
                    }
                    case 'gameData': {
                        this.onGameDataReceived(connection.clientId, parsedData.data, null, false);
                        break;
                    }
                    case 'playerAndGameData': {
                        // Encapsulate the case in a block to use const/let
                        const { playerData, gameData } = parsedData.data;
                        this.onPlayerDataReceived(connection.clientId, playerData, gameData);
                        this.onGameDataReceived(connection.clientId, gameData, playerData, true);
                        break;
                    }
                    default:
                        console.error(`Unknown data type received from client ${connection.clientId}:`, parsedData);
                        break;
                }
            } catch (error) {
                console.error('Error handling incoming data:', error);
            }
        };

        connection.setDataHandler(dataHandler);
    }

    // --- end HostConnections ---
    trySendDataViaWebRTC(userId: string | null, data: any, type: string): boolean {
        if (userId === null) {
            // Send data to all users
            let allSendsSuccessful = true;
            hostConnections.playerConnections.forEach(connection => {
                const success = connection.sendDataViaWebRTC({ data, type });
                if (!success) {
                    console.error(`Failed to send data via WebRTC to ${connection.clientId}`);
                    allSendsSuccessful = false;
                }
            });
            return allSendsSuccessful;
        } else {
            // Send data to a specific user
            const connection = hostConnections.playerConnections.find(conn => conn.clientId === userId);
            return connection ? connection.sendDataViaWebRTC({ data, type }) : false;
        }
    }

    // --- end WEBRTC ---

    // PlayerData --------------------
    abstract getPlayerDataToSend(userId: string): Partial<PlayerDataType> | undefined;

    // override this
    abstract onPlayerDataReceived(userId: string, playerData: Partial<PlayerDataType>, gameData: Partial<GameDataType> | null): void

    listenForPlayerData() {
        socket.on("playerDataToHost", (userId, playerData: Partial<PlayerDataType>) => {
            this.onPlayerDataReceived(userId, playerData, null);
        });
    }

    socketListenForGetUserStateRequest() {
        socket.on("getPlayerData", (userId: string) => {
            this.sendPlayerData(userId);
        });
    }

    sendPlayerData(userId: string, playerData: Partial<PlayerDataType> | undefined = undefined) {
        const playerDataToSend = playerData || this.getPlayerDataToSend(userId);
        const success = this.trySendDataViaWebRTC(userId, playerDataToSend, 'playerData');

        if (!success) {
            console.log('failed had to use sockets to send player data');
            socket.emit("playerDataToUser", userId, playerDataToSend);
        }
    }

    // GameData --------------------
    abstract getGameDataToSend(): Partial<GameDataType> | undefined;

    // Override this
    abstract onGameDataReceived(userId: string, gameData: Partial<GameDataType>, playerData: Partial<PlayerDataType> | null, updateGameData: boolean): void

    listenForGameData() {
        socket.on("gameDataToHost", (userId: string, gameData: Partial<GameDataType>, updateGameData: boolean) => {
            this.onGameDataReceived(userId, gameData, null, updateGameData);
        });
    }

    socketListenForGetGameStateRequest() {
        socket.on("getGameData", (userId: string) => {
            this.sendGameData(userId);
        });
    }

    sendGameData(userId: string | null = null, gameData: Partial<GameDataType> | undefined = undefined) {
        const gameDataToSend = gameData || this.getGameDataToSend();
        const success = this.trySendDataViaWebRTC(userId, gameDataToSend, 'gameData');

        // If WebRTC fails, fall back to using socket
        if (!success) {
            console.log('failed had to use sockets to send game data');
            socket.emit("gameDataToUser", userId, gameDataToSend);
        }
    }

    // Data (BOTH PLAYER AND GAME DATA) --------------------
    listenForData() {
        socket.on("dataToHost", (userId: string, gameData: Partial<GameDataType>, playerData: Partial<PlayerDataType>, updateGameData: boolean) => {
            this.onGameDataReceived(userId, gameData, playerData, updateGameData);
            this.onPlayerDataReceived(userId, playerData, gameData);
        });
    }

    socketListenForGetDataRequest() {
        socket.on("getData", (userId: string) => {
            this.sendData(userId);
        });
    }

    sendData(userId: string, gameData: Partial<GameDataType> | undefined = undefined, playerData: Partial<PlayerDataType> | undefined = undefined) {
        const gameDataToSend = gameData || this.getGameDataToSend();
        const playerDataToSend = playerData || this.getPlayerDataToSend(userId);

        // First try to send via WebRTC
        const combinedData = { type: 'playerAndGameData', gameData: gameDataToSend, playerData: playerDataToSend };
        const success = this.trySendDataViaWebRTC(userId, combinedData, 'playerAndGameData');

        // If WebRTC fails, fall back to using socket
        if (!success) {
            console.log('failed had to use sockets to send data');
            socket.emit("dataToUser", userId, gameDataToSend, playerDataToSend);
        }
    }
    // --- end data ---
}