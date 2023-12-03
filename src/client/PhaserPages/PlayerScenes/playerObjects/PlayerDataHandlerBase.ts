import { GameData, PlayerData } from "../../../../shared/data/Data";
import socket from "../../../SocketConnection";
import clientConnection from "../../../WebRTC/ClientConnection";

export abstract class
    PlayerDataHandlerBase
    <PlayerDataType extends PlayerData,
        GameDataType extends GameData>
{
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    create() {
        this.listenForGameData();
        this.listenForPlayerData();
        this.listenForData();
        this.requestData();

        this.initializeWebRTCDataListener();

        this.initializeConnectionReadyCallback();

        // on scene destroy
        this.scene.events.on("shutdown", () => {
            this.destroy();
        });
        this.scene.events.on('destroy', () => {
            this.destroy();
        });
    }

    private initializeConnectionReadyCallback() {
        clientConnection.setOnConnectionReadyCallback(() => this.initializeWebRTCDataListener());
    }

    destroy() {
        console.log('destroying player data handler');
        socket.removeListener("playerDataToUser");
        socket.removeListener("gameDataToUser");
        socket.removeListener("dataToUser");
    }

    // WEBRTC --------------------
    initializeWebRTCDataListener() {
        if (!clientConnection.hostConnection) return;
        const dataHandler = (data: any) => {
            try {
                const parsedData = JSON.parse(data);
                console.log('received data via WebRTC:', parsedData);
                switch (parsedData.type) {
                    case 'playerData':
                        this.onPlayerDataReceived(parsedData.data, null);
                        break;
                    case 'gameData':
                        this.onGameDataReceived(parsedData.data, null);
                        break;
                    case 'playerAndGameData': {
                        const { playerData, gameData } = parsedData.data;
                        this.onPlayerDataReceived(playerData, gameData);
                        this.onGameDataReceived(gameData, playerData);
                        break;
                    }
                    default:
                        console.error(`Unknown data type received:`, parsedData);
                        break;
                }
            } catch (error) {
                console.error('Error handling incoming WebRTC data:', error);
            }
        };

        clientConnection.hostConnection.setDataHandler(dataHandler);
    }

    trySendDataViaWebRTC(data: any, dataType: string): boolean {
        if (!clientConnection.hostConnection) {
            return false;
        }

        const success = clientConnection.hostConnection.sendDataViaWebRTC({ type: dataType, data });
        if (!success) {
            console.error(`Failed to send ${dataType} via WebRTC`);
        }
        return success;
    }

    // --- end WEBRTC ---

    // PlayerData --------------------
    abstract getPlayerDataToSend(): Partial<PlayerDataType> | undefined;

    abstract onPlayerDataReceived(playerData: Partial<PlayerDataType>, gameData: Partial<GameDataType> | null): void;

    listenForPlayerData() {
        socket.on("playerDataToUser", (playerData: Partial<PlayerDataType>) => {
            this.onPlayerDataReceived(playerData, null);
        });
    }

    sendPlayerData() {
        const playerDataToSend = this.getPlayerDataToSend();
        const success = this.trySendDataViaWebRTC(playerDataToSend, 'playerData');
        if (!success) {
            console.log('Sending player data via sockets');
            socket.emit("playerDataToHost", playerDataToSend);
        }
    }

    requestPlayerData() {
        socket.emit("getPlayerData");
    }

    // GameData --------------------
    abstract getGameDataToSend(): Partial<GameDataType> | undefined;

    abstract onGameDataReceived(gameData: Partial<GameDataType>, playerData: Partial<PlayerDataType> | null): void;

    listenForGameData() {
        socket.on("gameDataToUser", (gameData: Partial<GameDataType>) => {
            this.onGameDataReceived(gameData, null);
        });
    }

    sendGameData(updateGameData: boolean = false) {
        const gameDataToSend = this.getGameDataToSend();
        const success = this.trySendDataViaWebRTC(gameDataToSend, 'gameData');
        if (!success) {
            console.log('Sending game data via sockets');
            socket.emit("gameDataToHost", gameDataToSend, updateGameData);
        }
    }

    requestGameData() {
        socket.emit("getGameData");
    }

    // Data (BOTH PLAYER AND GAME DATA) --------------------
    getData(): [Partial<GameDataType> | undefined, Partial<PlayerDataType> | undefined] {
        return [this.getGameDataToSend(), this.getPlayerDataToSend()];
    }

    listenForData() {
        socket.on("dataToUser", (gameData: Partial<GameDataType>, playerData: Partial<PlayerDataType>) => {
            this.onGameDataReceived(gameData, playerData);
            this.onPlayerDataReceived(playerData, gameData);
        });
    }

    sendData(updateGameData: boolean = false) {
        const gameDataToSend = this.getGameDataToSend();
        const playerDataToSend = this.getPlayerDataToSend();
        const combinedData = { gameData: gameDataToSend, playerData: playerDataToSend };

        const success = this.trySendDataViaWebRTC(combinedData, 'playerAndGameData');
        if (!success) {
            console.log('Sending combined data via sockets');
            socket.emit("dataToHost", gameDataToSend, playerDataToSend, updateGameData);
        }
    }

    requestData() {
        socket.emit("getData");
    }

    // --- end data ---
}