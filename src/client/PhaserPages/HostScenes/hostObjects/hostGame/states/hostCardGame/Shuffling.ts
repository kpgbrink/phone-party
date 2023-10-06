import { CardGameData, PlayerCardHandData } from "api/src/data/datas/CardData";
import { DegreesToRadians, getScreenCenter, randomFloatBetween } from "../../../../../objects/Tools";
import { CardGameUserAvatarContainer } from "../../../../../objects/userAvatarContainer/CardGameUserAvatarContainer";
import { HostUserAvatarsAroundTableGame } from "../../../HostUserAvatars/HostUserAvatarsAroundTable/HostUserAvatarsAroundTableGame";
import { HostCardGame } from "../../HostCardGame";
import { HostGameState } from "../HostGameState";
import { BringCardsToDealer } from "./BringCardsToDealer";


export class Shuffling<
    GameDataType extends CardGameData,
    PlayerDataType extends PlayerCardHandData,
    UserAvatars extends HostUserAvatarsAroundTableGame<UserAvatarType>,
    UserAvatarType extends CardGameUserAvatarContainer<PlayerDataType>> extends HostGameState<PlayerDataType, GameDataType> {
    hostGame: HostCardGame<GameDataType, PlayerDataType, UserAvatars, UserAvatarType>;
    randomStartingOffset: number = 500;
    randomStartingRotationalVelocity: number = DegreesToRadians(360);
    massCenter = 50 * 60 * 60 * 4;
    shufflingTime: number = .5;

    constructor(hostGame: HostCardGame<GameDataType, PlayerDataType, UserAvatars, UserAvatarType>) {
        super(hostGame);
        this.hostGame = hostGame;
    }

    getShufflingTime() {
        const baseShufflingTime = this.shufflingTime;
        const shufflingCount = this.hostGame.shufflingAmount.defaultValue - this.hostGame.shufflingAmount.value;
        return baseShufflingTime / (shufflingCount + 1);
    }

    enter() {
        // set the card movement to randomness
        const screenCenter = getScreenCenter(this.hostGame.hostScene);

        // shuffle the cards
        this.hostGame.cards.shuffle();

        // set random card movement
        this.hostGame.cards.cardContainers.forEach(cardContainer => {
            // set random card offset
            const x = screenCenter.x + randomFloatBetween(-this.randomStartingOffset, this.randomStartingOffset);
            const y = screenCenter.y + randomFloatBetween(-this.randomStartingOffset, this.randomStartingOffset);
            cardContainer.startMovingOverTimeTo({ x, y, rotation: 0, scale: 1 }, this.getShufflingTime());
        });
    }

    update(time: number, delta: number): HostGameState<PlayerDataType, GameDataType> | null {
        // shuffle then switch to deal state
        this.hostGame.cards.update(time, delta);
        // once all cards are done moving, start the next round
        if (this.hostGame.cards.cardContainers.every(cardContainer => cardContainer.moveOnDuration === null)) {
            this.hostGame.shufflingAmount.value--;
            if (this.hostGame.shufflingAmount.value > 0) {
                this.hostGame.changeState(new Shuffling(this.hostGame));
            } else {
                this.hostGame.changeState(new BringCardsToDealer(this.hostGame));
            }
        }
        return null;
    }

    exit() {
        // on exit
    }
}