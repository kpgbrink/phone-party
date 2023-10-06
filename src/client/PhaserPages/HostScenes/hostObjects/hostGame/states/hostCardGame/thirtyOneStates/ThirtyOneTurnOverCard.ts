import { ThirtyOneCardGameData, ThirtyOnePlayerCardHandData } from "api/src/data/datas/cardHandDatas/ThirtyOneCardHandData";
import { ThirtyOneGame } from "../../../ThirtyOneGame";
import { HostGameState } from "../../HostGameState";
import { ThirtyOneGamePlayerTurn } from "./ThirtyOneGamePlayerTurn";

// Bring cards to the random dealer and have the cards start going out to people.
export class ThirtyOneGameTurnOverCard extends HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> {
    hostGame: ThirtyOneGame;
    bringShownCardToPositionTime: number = 1;

    constructor(hostGame: ThirtyOneGame) {
        super(hostGame);
        this.hostGame = hostGame;
    }

    enter() {
        // start moving cards to random dealer
        this.startMovingCardsToCenter();
    }

    startMovingCardsToCenter() {
        // move cards to center.
        const cardContainer = this.hostGame.cards.getTopFaceDownCard();
        if (!cardContainer) {
            throw new Error("No card container found");
        }
        cardContainer.startMovingOverTimeTo(this.hostGame.cardPlaceTransform, this.bringShownCardToPositionTime, () => {
            cardContainer.setFaceUp(true);
        });
    }

    update(time: number, delta: number): HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> | null {
        this.hostGame.cards.update(time, delta);
        // check if all cards are in the dealer
        if (this.hostGame.cards.cardContainers.every(cardContainer =>
            cardContainer.moveOnDuration === null
        )) {
            return new ThirtyOneGamePlayerTurn(this.hostGame);
        }
        return null;
    }

    exit() {
    }
}