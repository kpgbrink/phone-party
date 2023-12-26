import { GameData, PlayerData } from "../Data.js";

export class PlayerCardHandData extends PlayerData {
    pickUpTo: number | null = null;
    dropTo: number | null = null;
    pickUpFaceDownCardIds: number[] = [];
    pickUpFaceUpCardIds: number[] = [];
    cardIds: number[] = [];
    requestDeal: boolean = false;
}

export class CardGameData extends GameData {
    playerDealerId: string | null = null;
    playerTurnId: string | null = null;
    turn: number = 0;
    startDealing: boolean = false;
    waitingForDeal: boolean = false;
    roundOver: boolean = false;
}
