import { ThirtyOneCardGameData, ThirtyOnePlayerCardHandData } from "api/src/data/datas/cardHandDatas/ThirtyOneCardHandData";
import { CountdownTimer } from "../../../../../../objects/CountdownTimer";
import { ThirtyOneGame } from "../../../ThirtyOneGame";
import { HostGameState } from "../../HostGameState";

// Bring cards to the random dealer and have the cards start going out to people.
export class ThirtyOneGameEnd extends HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> {
    hostGame: ThirtyOneGame;
    bringShownCardToPositionTime: number = 1;

    timeBackToGameChooseScreen: number = 12;
    // timer for starting the next round
    timerBackToGameChooseScreen: CountdownTimer = new CountdownTimer(this.timeBackToGameChooseScreen);

    constructor(hostGame: ThirtyOneGame) {
        super(hostGame);
        this.hostGame = hostGame;
    }

    enter() {
    }

    override getGameDataToSend(): Partial<ThirtyOneCardGameData> | undefined {
        const gameData: Partial<ThirtyOneCardGameData> = {};
        gameData.gameOver = true;
        return gameData;
    }

    update(time: number, delta: number): HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> | null {
        this.hostGame.cards.update(time, delta);
        this.timerBackToGameChooseScreen.update(delta);
        if (this.timerBackToGameChooseScreen.isDone()) {
            // set url back to home screen
            this.hostGame.hostScene.setUrlToHomeScreen();
        }
        return null;
    }

    exit() {
    }
}