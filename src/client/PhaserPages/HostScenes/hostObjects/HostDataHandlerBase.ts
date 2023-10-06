import { GameData, PlayerData } from "api/src/data/Data";
import socket from "../../../SocketConnection";

export abstract class HostDataHandlerBase<PlayerDataType extends PlayerData, GameDataType extends GameData> {

    create() {
        this.listenForGameData();
        this.listenForPlayerData();
        this.listenForData();
        this.socketListenForGetUserStateRequest();
        this.socketListenForGetGameStateRequest();
        this.socketListenForGetDataRequest();
    }

    destroy() {
        socket.removeListener("playerDataToHost");
        socket.removeListener("gameDataToHost");
        socket.removeListener("dataToHost");
        socket.removeListener("getPlayerData");
        socket.removeListener("getGameData");
        socket.removeListener("getData");
    }

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
        socket.emit("playerDataToUser", userId, playerDataToSend);
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
        socket.emit("gameDataToUser", userId, gameDataToSend);
    }
    // Data --------------------

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
        socket.emit("dataToUser", userId, gameDataToSend, playerDataToSend);
    }

    // --- end data ---
}