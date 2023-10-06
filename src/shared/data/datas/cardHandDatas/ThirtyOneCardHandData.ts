import { CardGameData, PlayerCardHandData } from "../CardData.js";

export class ThirtyOnePlayerCardHandData extends PlayerCardHandData {
}

export class ThirtyOneCardGameData extends CardGameData {
    knockPlayerId: string | null = null;
    thirtyOnePlayerId: string | null = null;
}