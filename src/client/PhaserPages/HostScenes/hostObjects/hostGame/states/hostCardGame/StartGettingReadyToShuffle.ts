import { CardGameData, PlayerCardHandData } from "api/src/data/datas/CardData";
import { getScreenCenter } from "../../../../../objects/Tools";
import { CardGameUserAvatarContainer } from "../../../../../objects/userAvatarContainer/CardGameUserAvatarContainer";
import { HostUserAvatarsAroundTableGame } from "../../../HostUserAvatars/HostUserAvatarsAroundTable/HostUserAvatarsAroundTableGame";
import { HostCardGame } from "../../HostCardGame";
import { HostGameState } from "../HostGameState";
import { Shuffling } from "./Shuffling";

export class StartGettingReadyToShuffle<
    GameDataType extends CardGameData,
    PlayerDataType extends PlayerCardHandData,
    UserAvatars extends HostUserAvatarsAroundTableGame<UserAvatarType>,
    UserAvatarType extends CardGameUserAvatarContainer<PlayerDataType>> extends HostGameState<PlayerDataType, GameDataType> {
    hostGame: HostCardGame<GameDataType, PlayerDataType, UserAvatars, UserAvatarType>;
    // store the countdown timer for the movement of the card and the card that is moving
    sendingOutCardTime: number = .7;

    constructor(hostGame: HostCardGame<GameDataType, PlayerDataType, UserAvatars, UserAvatarType>) {
        super(hostGame);
        this.hostGame = hostGame;
    }

    enter() {
        const screenCenter = getScreenCenter(this.hostGame.hostScene);
        this.hostGame.cardInHandTransform.setToDefault();

        this.hostGame.cards.cardContainers.forEach(cardContainer => {
            // remove all cards from the player hand
            cardContainer.removeFromHand();

            // set all cards face down
            cardContainer.setFaceUp(false);
            // remove tint from all cards
            cardContainer.frontImage?.setTint(0xffffff);
            // remove the special transform on the card
            cardContainer.cardInHandOffsetTransform.setToDefault();
            // start moving all of the cards to the center
            cardContainer.startMovingOverTimeTo({ x: screenCenter.x, y: screenCenter.y, rotation: 0, scale: 1 }, this.sendingOutCardTime);
        });
        // send data to all users
        this.hostGame?.hostUserAvatars?.userAvatarContainers?.forEach(userAvatar => {
            this.hostGame.sendData(userAvatar.user.id);
        });
    }

    update(time: number, delta: number): HostGameState<PlayerDataType, GameDataType> | null {
        this.hostGame.cards.update(time, delta);
        // once all cards are done moving, start the next round
        if (this.hostGame.cards.cardContainers.every(cardContainer => cardContainer.moveOnDuration === null)) {
            this.hostGame.shufflingAmount.setToDefault();
            this.hostGame.changeState(new Shuffling(this.hostGame));
        }
        return null;
    }

    exit() {
        // on exit
    }
}