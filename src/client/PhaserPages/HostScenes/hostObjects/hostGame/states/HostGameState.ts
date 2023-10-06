import { GameData, PlayerData } from "api/src/data/Data";
import { HostGame } from "../../HostGame";

export abstract class HostGameState<PlayerDataType extends PlayerData, GameDataType extends GameData> {
    hostGame: HostGame<PlayerDataType, GameDataType>;

    constructor(hostGame: HostGame<PlayerDataType, GameDataType>) {
        this.hostGame = hostGame;
    }

    // this is weird to have on the super base class...
    // but it's the only way to get the game to start
    onItemMoveToTable() {

    }

    // PlayerData --------------------
    getPlayerDataToSend(userId: string): Partial<PlayerDataType> | undefined {
        return;
    }

    onPlayerDataReceived(userId: string, playerData: Partial<PlayerDataType>, gameData: Partial<GameDataType> | null) { }

    // GameData --------------------
    getGameDataToSend(): Partial<GameDataType> | undefined {
        return;
    }

    onGameDataReceived(userId: string, gameData: Partial<GameDataType>, playerData: Partial<PlayerDataType> | null, updateGameData: boolean) { }
    // --------------------

    abstract enter(): void;

    abstract update(time: number, delta: number): void;

    abstract exit(): void;
}