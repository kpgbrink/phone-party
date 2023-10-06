import { GameData, PlayerData } from "api/src/data/Data";
import { HostDataHandlerBase } from "./HostDataHandlerBase";

export abstract class HostDataHandler<PlayerDataType extends PlayerData, GameDataType extends GameData>
    extends HostDataHandlerBase<PlayerDataType, GameDataType> {

    create() {
        super.create();
    }

    // PlayerData --------------------
    abstract getPlayerDataToSend(userId: string): Partial<PlayerDataType> | undefined;

    // override this
    abstract onPlayerDataReceived(userId: string, playerData: Partial<PlayerDataType>, gameData: Partial<GameDataType> | null): void

    // GameData --------------------

    abstract getGameDataToSend(): Partial<GameDataType> | undefined;

    // Override this
    abstract onGameDataReceived(userId: string, gameData: Partial<GameDataType>, playerData: Partial<PlayerDataType> | null, updateGameData: boolean): void

    // --- end data ---
}