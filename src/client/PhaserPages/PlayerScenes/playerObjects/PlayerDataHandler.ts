import { GameData, InputData, PlayerData } from "../../../../shared/data/Data";
import { PlayerDataHandlerBase } from "./PlayerDataHandlerBase";

export abstract class
    PlayerDataHandler
    <PlayerDataType extends PlayerData,
        GameDataType extends GameData,
        InputDataType extends InputData> extends PlayerDataHandlerBase<PlayerDataType, GameDataType, InputDataType> {

    abstract playerData: PlayerDataType;
    abstract gameData: GameDataType;

    create() {
        super.create();
    }

    // PlayerData --------------------
    abstract getPlayerDataToSend(): Partial<PlayerDataType> | undefined;

    abstract onPlayerDataReceived(playerData: Partial<PlayerDataType>, gameData: Partial<GameDataType> | null): void;

    // GameData --------------------
    abstract getGameDataToSend(): Partial<GameDataType> | undefined;

    abstract onGameDataReceived(gameData: Partial<GameDataType>, playerData: Partial<PlayerDataType> | null): void;
    // --- end data ---

}