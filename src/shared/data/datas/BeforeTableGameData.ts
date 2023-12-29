import { GameData, PlayerData } from "../Data.js";

export class PlayerBeforeTableGameData extends PlayerData {
    ready: boolean = false;
}

export class BeforeTableGameData extends GameData {
}

export class PlayerBeforeTableGameInputData {
    left: boolean = false;
    right: boolean = false;
}
