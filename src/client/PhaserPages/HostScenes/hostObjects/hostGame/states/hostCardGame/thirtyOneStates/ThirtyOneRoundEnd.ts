import { CardInputData } from "../../../../../../../../shared/data/datas/CardData";
import { ThirtyOneCardGameData, ThirtyOnePlayerCardHandData } from "../../../../../../../../shared/data/datas/cardHandDatas/ThirtyOneCardHandData";
import { CountdownTimer } from "../../../../../../objects/CountdownTimer";
import CardContainer from "../../../../../../objects/items/CardContainer";
import { ThirtyOneGame } from "../../../ThirtyOneGame";
import { HostGameState } from "../../HostGameState";
import { StartGettingReadyToShuffle } from "../StartGettingReadyToShuffle";
import { ThirtyOneGameEnd } from "./ThirtyOneGameEnd";

// Bring cards to the random dealer and have the cards start going out to people.
export class ThirtyOneRoundEnd extends HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> {
    hostGame: ThirtyOneGame;
    bringShownCardToPositionTime: number = 1;

    timeToNextRound: number = 60 * 2;
    // timer for starting the next round
    timerNextRound: CountdownTimer = new CountdownTimer(this.timeToNextRound);

    timerText: Phaser.GameObjects.Text | null = null;

    constructor(hostGame: ThirtyOneGame) {
        super(hostGame);
        this.hostGame = hostGame;
    }

    enter() {
        // display the player's cards and their scores.

        // increate the size of the cards in player hands and make them face up
        this.hostGame.cards.cardContainers.filter(c => c.userHandId).forEach(cardContainer => {
            this.hostGame.minDistanceBetweenCards.value = 500;
            this.hostGame.cardInHandTransform.value = { ...this.hostGame.cardInHandTransform.value, scale: 1.5 };
            cardContainer.frontImage?.setTint(0x555555);
            cardContainer.inHandFaceUp = true;
            cardContainer.setFaceUp(true);
        });
        // add a countdown timer to the next round basically showing timerToNextRound current value
        this.timerText = this.hostGame.hostScene.add.text(2060, 660, this.getTimerText(), { fontSize: '68px', color: 'white' });
        this.timerText.setOrigin(0.5, 0.5);

        this.calculateAndHandleScores();
    }

    getTimerText() {
        return `Next Deal Timer: ${Math.floor(this.timerNextRound.currentTime)}`;
    }

    updateTimerText() {
        console.log('update timer');
        this.timerText?.setText(this.getTimerText());
    }

    update(time: number, delta: number): HostGameState<ThirtyOnePlayerCardHandData, ThirtyOneCardGameData> | null {
        this.hostGame.cards.update(time, delta);
        this.timerNextRound.update(delta);
        if (this.timerNextRound.isDone()) {
            this.hostGame.changeState(new StartGettingReadyToShuffle(this.hostGame));
        }
        this.updateTimerText();
        return null;
    }

    // calculate the score for each player
    calculateAndHandleScores() {
        // calculate the score for each player
        this.hostGame.hostUserAvatars?.userAvatarContainers.forEach(userAvatar => {
            const cardContainers = this.hostGame.cards.cardContainers.filter(c => c.userHandId === userAvatar.user.id);
            const { score, cardsThatMatter } = ThirtyOneRoundEnd.calculateScoreAndCardsThatMatter(cardContainers);
            // show the cards that matter differently
            cardsThatMatter.forEach(cardContainer => {
                cardContainer.frontImage?.setTint(0xffffff);
                cardContainer.cardInHandOffsetTransform.value = { ...cardContainer.cardInHandOffsetTransform.value, y: 200, scale: 2 / 1.5 };
                // set the cards to be face up
            });
            userAvatar.roundScore = score;
            return { score, cardsThatMatter };
        });
        // get all users with the lowest score
        if (!this.hostGame.hostUserAvatars) throw new Error('no host user avatars');
        const userAvatarContainers = this.hostGame.hostUserAvatars?.userAvatarContainers || [];
        const lowestScore = Math.min(...userAvatarContainers.map(u => u.roundScore));
        const lowestScoreUsers = this.hostGame.hostUserAvatars?.userAvatarContainers.filter(u => u.roundScore === lowestScore);
        // all users with the lowest score lose a life except for the user who knocked if there are more than 1
        // if the user who knocked is the lowest score user then they lose 2 lives
        // if a player got 31 then everyone else loses a life
        // check if there is a 31 score
        (() => {
            if (this.hostGame.gameData.thirtyOnePlayerId) {
                // make every other user lose 1 life
                this.hostGame.hostUserAvatars?.userAvatarContainers.forEach(userAvatar => {
                    if (userAvatar.user.id !== this.hostGame.gameData.thirtyOnePlayerId) {
                        userAvatar.lives -= 1;
                    }
                });
                return;
            }
            if (lowestScoreUsers.length === 1) {
                const lowestScoreUser = lowestScoreUsers[0];
                lowestScoreUser.lives -= 1;
                if (lowestScoreUser.user.id === this.hostGame.gameData.knockPlayerId) {
                    lowestScoreUser.lives -= 1;
                }
                return;
            }
            lowestScoreUsers.forEach(lowestScoreUser => {
                lowestScoreUser.lives -= 1;
                if (lowestScoreUser.user.id === this.hostGame.gameData.knockPlayerId) {
                    lowestScoreUser.lives += 1;
                }
            });
        })();


        // update the poker chips in front of each user
        this.hostGame.hostUserAvatars?.userAvatarContainers.forEach(userAvatar => {
            userAvatar.updatePokerChips();
        });

        // if only one user has lives then they win
        const usersWithLives = this.hostGame.hostUserAvatars?.userAvatarContainers.filter(u => u.lives > 0);
        if (usersWithLives.length === 1) {
            // set state to the winner
            this.hostGame.changeState(new ThirtyOneGameEnd(this.hostGame));
            return;
        }

        // TODO make this possible to be using new system
        // tell dealer they can deal
        this.hostGame.setDealButtonOnUser();
    }

    static calculateScoreAndCardsThatMatter(cardContainers: CardContainer[]) {
        // check if all cards have same number then score is 31
        const allCardsSameNumber = cardContainers.every(c => c.cardContent.rank === cardContainers[0].cardContent.rank);
        if (allCardsSameNumber) {
            return { score: 30, cardsThatMatter: cardContainers };
        }

        // add up all points of the cards for each suit
        const cardsBySuit = (() => {
            const cardsBySuit: { suit: string, score: number }[] = [];
            cardContainers.forEach(cardContainer => {
                const card = cardContainer.cardContent;
                if (!card.suit || !card.rank) return;
                const suit = card.suit;
                const score = (() => {
                    if (card.rank === 'Ace') return 11;
                    if (card.rank === 'Jack' || card.rank === 'Queen' || card.rank === 'King') return 10;
                    return parseInt(card.rank);
                })();
                const cardBySuit = cardsBySuit.find(c => c.suit === suit);
                if (cardBySuit) {
                    cardBySuit.score += score;
                } else {
                    cardsBySuit.push({ suit, score });
                }
            });
            return cardsBySuit;
        })();
        // get the highest score and suit
        const highestScore = Math.max(...cardsBySuit.map(c => c.score));
        const suitAndScore = cardsBySuit.find(c => c.score === highestScore);
        if (!suitAndScore) return { score: 0, cardsThatMatter: cardContainers };
        const cardsInSuit = cardContainers.filter(c => c.cardContent.suit === suitAndScore.suit);
        return { score: highestScore, cardsThatMatter: cardsInSuit };
    }

    override onPlayerDataReceived(userId: string, playerData: Partial<ThirtyOnePlayerCardHandData>, gameData: Partial<ThirtyOneCardGameData> | null): void {
    }

    override onGameDataReceived(userId: string, gameData: Partial<ThirtyOneCardGameData>, playerData: Partial<ThirtyOnePlayerCardHandData> | null, updateGameData: boolean): void {
        console.log('onGameDataReceived end', gameData, playerData, updateGameData);
        this.updateDealing(gameData, playerData, updateGameData);
    }

    override getGameDataToSend(): Partial<ThirtyOneCardGameData> | undefined {
        const gameData: Partial<ThirtyOneCardGameData> = {};
        gameData.waitingForDeal = true;
        gameData.roundOver = true;
        return gameData;
    }

    override onInputReceived(clientId: string, input: Partial<CardInputData>): void {
        console.log('onInputReceived end', clientId, input);
        if (input.requestDeal) {
            // Add your code here
            this.timerNextRound.currentTime /= 1.5;
            // show the request deal text
            this.hostGame.hostUserAvatars?.userAvatarContainers.forEach(userAvatar => {
                if (userAvatar.user.id === clientId) {
                    userAvatar.showRequestDealText();
                }
            });
        }
    }

    updateDealing(gameData: Partial<ThirtyOneCardGameData>, playerData: Partial<ThirtyOnePlayerCardHandData> | null, updateGameData: boolean): void {
        if (!updateGameData) return;
        console.log('gameData', gameData);
        if (gameData.startDealing) {
            // deal the cards
            console.log('start dealing');
            this.timerNextRound.currentTime = 0;
        }
    }

    destroyTimerText() {
        console.log('destroy timer text', this.timerText);
        if (!this.timerText)
            return;
        this.timerText.visible = false;
        this.timerText.destroy();
        this.timerText = null;
    }

    exit() {
        this.hostGame.gameData.knockPlayerId = null;
        this.hostGame.gameData.thirtyOnePlayerId = null;
        // delete the timer text
        this.destroyTimerText();
    }
}