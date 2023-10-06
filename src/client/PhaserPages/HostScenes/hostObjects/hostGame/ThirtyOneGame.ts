import { ThirtyOneCardGameData, ThirtyOnePlayerCardHandData } from "api/src/data/datas/cardHandDatas/ThirtyOneCardHandData";
import CardContainer from "../../../objects/items/CardContainer";
import { loadIfImageNotLoaded, Transform, transformRelativeToScreenCenter } from "../../../objects/Tools";
import { ThirtyOneUserAvatarContainer } from "../../../objects/userAvatarContainer/cardGameUserAvatarContainer/ThirtyOneUserAvatarContainer";
import HostScene from "../HostScene";
import ThirtyOneHostUserAvatarsAroundTableGame from "../HostUserAvatars/HostUserAvatarsAroundTable/ThirtyOneHostUserAvatarsAroundTableGame";
import { HostCardGame } from "./HostCardGame";
import { ThirtyOneGameStart } from "./states/hostCardGame/thirtyOneStates/ThirtyOneGameStart";
import { ThirtyOneRoundEnd } from "./states/hostCardGame/thirtyOneStates/ThirtyOneRoundEnd";
import { HostGameState } from "./states/HostGameState";


export class ThirtyOneGame
    extends HostCardGame<ThirtyOneCardGameData, ThirtyOnePlayerCardHandData, ThirtyOneHostUserAvatarsAroundTableGame, ThirtyOneUserAvatarContainer> {
    gameData: ThirtyOneCardGameData;

    dealAmount: number = 3;

    hostUserAvatars: ThirtyOneHostUserAvatarsAroundTableGame | null = null;

    deckTransform: Transform = { x: 0, y: 0, rotation: 0, scale: 1 };
    cardPlaceTransform: Transform = { x: 0, y: 0, rotation: 0, scale: 1 };

    constructor(hostScene: HostScene) {
        super(hostScene);
        this.hostScene = hostScene;
        this.gameData = new ThirtyOneCardGameData();
    }

    preload() {
        super.preload();
        loadIfImageNotLoaded(this.hostScene, 'bluePokerChip', 'assets/pokerChips/bluePokerChip.png');
    }

    // override this maybe
    override createHostUserAvatarsAroundTableGame() {
        this.hostUserAvatars = new ThirtyOneHostUserAvatarsAroundTableGame(this.hostScene);
        this.hostUserAvatars.createOnRoomData();
        this.hostUserAvatars.moveToEdgeOfTable();
        this.hostUserAvatars.userAvatarContainers.forEach(player => {
            player.create();
            player.depth = 100;
        });
    }

    create() {
        super.create();

        this.deckTransform = (() => {
            const transform = { x: -330, y: 0, rotation: 0, scale: 4 };
            return transformRelativeToScreenCenter(this.hostScene, transform);
        })();
        this.cardPlaceTransform = (() => {
            const transform = { x: 330, y: 0, rotation: 0, scale: 4 };
            return transformRelativeToScreenCenter(this.hostScene, transform);
        })();
    }

    onCardMoveToTable(userId: string, card: CardContainer): void {
        if (!card) return;
        card.setFaceUp(true);
        card.removeFromHand();
        // get count of face up cards
        const faceUpCards = this.cards.getTableCards().filter(card => card.getFaceUp());
        const faceUpCardsCount = faceUpCards.length;
        const transform = {
            ...this.cardPlaceTransform,
            x: this.cardPlaceTransform.x + (faceUpCardsCount * 2),
            y: this.cardPlaceTransform.y + (faceUpCardsCount * 2),
        };
        card.startMovingOverTimeTo(transform, 1.5, () => {

        });

        // maybe move this to differnet area.
        // also check if the player has 31 and if so, end the round
        const scoresAndCardsThatMatter = ThirtyOneRoundEnd.calculateScoreAndCardsThatMatter(this.cards.getPlayerCards(userId));
        if (scoresAndCardsThatMatter.score === 31 && this.gameData.knockPlayerId === null) {
            this.gameData.thirtyOnePlayerId = userId;
            this.changeState(new ThirtyOneRoundEnd(this));
        }

        // Fix this
        const topFaceUpCard = this.cards.getTopFaceUpCard();
        card.depth = topFaceUpCard ? topFaceUpCard.depth + 1 : 0;
        this.currentState?.onItemMoveToTable();
    }

    createGameStateAfterDealing(): HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> {
        return new ThirtyOneGameStart(this);
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.hostUserAvatars?.update(time, delta);
    }

    // ------------------------------------ Data ------------------------------------
    override getPlayerDataToSend(userId: string) {
        const user = this.getUser(userId);
        if (!user) return {};
        const playerCardHandData = super.getPlayerDataToSend(userId);
        const playerCardHandDataEmpty: Partial<ThirtyOnePlayerCardHandData> = {};
        const thirtyOnePlayerCardHandData: Partial<ThirtyOnePlayerCardHandData> = { ...playerCardHandDataEmpty, ...playerCardHandData };

        // add the thirty one specific stuff too
        return thirtyOnePlayerCardHandData;
    }

    override onPlayerDataReceived(userId: string, playerData: Partial<ThirtyOnePlayerCardHandData>, gameData: Partial<ThirtyOneCardGameData> | null): void {
        super.onPlayerDataReceived(userId, playerData, gameData);
        // TODO update the player avatar

    }

    override getGameDataToSend() {
        const gameData = super.getGameDataToSend();
        // add the thirty one specific stuff too
        return gameData;
    }

    override onGameDataReceived(userId: string, gameData: Partial<ThirtyOneCardGameData>, playerData: Partial<ThirtyOnePlayerCardHandData> | null, updateGameData: boolean): void {
        super.onGameDataReceived(userId, gameData, playerData, updateGameData);
    }

    // ------------------------------------ Data End ------------------------------------  // TODO remove this
} 