import { ThirtyOneCardGameData, ThirtyOnePlayerCardHandData } from "api/src/data/datas/cardHandDatas/ThirtyOneCardHandData";
import { ThirtyOneGame } from "../../../ThirtyOneGame";
import { HostGameState } from "../../HostGameState";
import { ThirtyOneGameTurnOverCard } from "./ThirtyOneTurnOverCard";

// Bring cards to the random dealer and have the cards start going out to people.
export class ThirtyOneGameStart extends HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> {
    hostGame: ThirtyOneGame;
    bringToCenterTime: number = 1;

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
        this.hostGame.cards.getTableCards().forEach((cardContainer, i) => {
            // add offest to make the number of cards visible
            const offset = i * 2;
            const deckTransform = this.hostGame.deckTransform;
            const transform = { ...deckTransform, x: deckTransform.x + offset, y: deckTransform.y + offset };
            cardContainer.startMovingOverTimeTo(transform, this.bringToCenterTime);
        });
    }

    update(time: number, delta: number): HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> | null {
        this.hostGame.cards.update(time, delta);
        // check if all cards are in the dealer
        if (this.hostGame.cards.cardContainers.every(cardContainer =>
            cardContainer.moveOnDuration === null
        )) {
            return new ThirtyOneGameTurnOverCard(this.hostGame);
        }
        return null;
    }

    exit() {
    }
}