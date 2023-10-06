import { ThirtyOneCardGameData, ThirtyOnePlayerCardHandData } from "api/src/data/datas/cardHandDatas/ThirtyOneCardHandData";
import { ThirtyOneGame } from "../../../ThirtyOneGame";
import { HostGameState } from "../../HostGameState";
import { ThirtyOneRoundEnd } from "./ThirtyOneRoundEnd";

// Bring cards to the random dealer and have the cards start going out to people.
export class ThirtyOneGamePlayerTurn extends HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> {
    hostGame: ThirtyOneGame;
    bringShownCardToPositionTime: number = 1;

    constructor(hostGame: ThirtyOneGame) {
        super(hostGame);
        this.hostGame = hostGame;
    }

    override getPlayerDataToSend(userId: string): Partial<ThirtyOnePlayerCardHandData> | undefined {
        const thirtyOnePlayerCardHandData: Partial<ThirtyOnePlayerCardHandData> = {};

        // check if it is the user's turn
        const isUserTurnPickUpPickUp = this.hostGame.gameData.playerTurnId === userId && this.hostGame.gameData.thirtyOnePlayerId === null;
        if (isUserTurnPickUpPickUp) {
            // send the cards the user can pick up 
            const topFaceUpCard = this.hostGame.cards.getTopFaceUpCard();
            const topFaceDownCard = this.hostGame.cards.getTopFaceDownCard();
            if (topFaceUpCard && topFaceDownCard) {
                thirtyOnePlayerCardHandData.pickUpFaceUpCardIds = [topFaceUpCard.id];
                thirtyOnePlayerCardHandData.pickUpFaceDownCardIds = [topFaceDownCard.id];
            }
            thirtyOnePlayerCardHandData.pickUpTo = 4;
            thirtyOnePlayerCardHandData.dropTo = 3;
        } else {
            thirtyOnePlayerCardHandData.pickUpFaceUpCardIds = [];
            thirtyOnePlayerCardHandData.pickUpFaceDownCardIds = [];
            thirtyOnePlayerCardHandData.pickUpTo = null;
            thirtyOnePlayerCardHandData.dropTo = null;
        }

        return thirtyOnePlayerCardHandData;
    }

    override onPlayerDataReceived(userId: string, playerData: Partial<ThirtyOnePlayerCardHandData>, gameData: Partial<ThirtyOneCardGameData> | null) {
        // check if the user is the player who's turn it is
        if (this.hostGame.gameData.playerTurnId !== userId) return;
        // check how many cards the user has
        // allowed cards to pick up
        const topFaceUpCard = this.hostGame.cards.getTopFaceUpCard();
        const topFaceDownCard = this.hostGame.cards.getTopFaceDownCard();
        const allowedPickUpCardIds: number[] = [];
        allowedPickUpCardIds.push(topFaceUpCard?.id ?? -1);
        allowedPickUpCardIds.push(topFaceDownCard?.id ?? -1);

        const playerCards = this.hostGame.cards.getPlayerCards(userId);
        const playerCardHandCount = playerCards.length;
        const allowedPickUpCardAmount = (() => {
            if (playerCardHandCount === 3) {
                return 4;
            }
            return null;
        })();
        const allowedDropCardAmount = (() => {
            if (playerCardHandCount === 4) {
                return 3;
            }
            return null;
        })();

        this.hostGame.updateCardsInHand(userId, playerData, allowedPickUpCardIds, allowedPickUpCardAmount, allowedDropCardAmount, false);
    }

    override onGameDataReceived(userId: string, gameData: Partial<ThirtyOneCardGameData>, playerData: Partial<ThirtyOnePlayerCardHandData> | null, updateGameData: boolean): void {
        this.updateKnocking(userId, gameData, playerData, updateGameData);
    }

    updateKnocking(userId: string, gameData: Partial<ThirtyOneCardGameData>, playerData: Partial<ThirtyOnePlayerCardHandData> | null, updateGameData: boolean): void {
        if (!updateGameData) return;
        // if it's not the player turn they cannot knock
        if (this.hostGame.gameData.playerTurnId !== userId || gameData.knockPlayerId === undefined) {
            // update user that the knocking is not allowed
            this.hostGame.sendGameData(userId);
            return;
        }
        if (gameData.knockPlayerId && !this.hostGame.gameData.knockPlayerId) {
            this.hostGame.gameData.knockPlayerId = gameData.knockPlayerId;
            this.hostGame.changeState(new ThirtyOneGamePlayerTurn(this.hostGame));
        }
    }

    enter() {
        // make the player to left of dealer start their turn
        this.hostGame.setNextPlayerTurn();
        this.sendPlayerPickUpCards();
    }

    update(time: number, delta: number): HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> | null {
        this.hostGame.cards.update(time, delta);
        // check if all cards are in the dealer
        return null;
    }

    onItemMoveToTable(): void {
        this.hostGame.changeState(new ThirtyOneGamePlayerTurn(this.hostGame));
    }

    exit() {
    }

    // TODO remove this
    sendPlayerPickUpCards() {
        // tell the player that it is their turn
        const hiddenCard = this.hostGame.cards.getTopFaceDownCard();
        const shownCard = this.hostGame.cards.getTopFaceUpCard();
        if (!shownCard) {
            return;
        }
        if (!hiddenCard) {
            this.hostGame.changeState(new ThirtyOneRoundEnd(this.hostGame));
            return;
        }

        // check if the turn has gone back to the player who knocked. Then need to go to end round state.
        if (this.hostGame.gameData.knockPlayerId === this.hostGame.gameData.playerTurnId) {
            this.hostGame.changeState(new ThirtyOneRoundEnd(this.hostGame));
            return;
        }
        if (this.hostGame.gameData.playerTurnId === null) throw new Error("No current player turn id");

        this.hostGame.sendData(this.hostGame.gameData.playerTurnId);

        // move the player indicator to the player who's turn it is
        this.hostGame.movePlayerTurnIndicatorToPlayer();
    }
}