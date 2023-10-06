import { CardGameData, PlayerCardHandData } from "api/src/data/datas/CardData";
import { Cards } from "../../objects/Cards";
import CardContainer from "../../objects/items/CardContainer";
import MenuButton from "../../objects/MenuButton";
import { persistentData } from "../../objects/PersistantData";
import { checkTransformsAlmostEqual, DegreesToRadians, getScreenCenter, getScreenDimensions, Transform } from "../../objects/Tools";
import { PlayerDataHandler } from "./PlayerDataHandler";
import PlayerScene from "./PlayerScene";

export abstract class PlayerCardHand
    <PlayerCardHandDataType extends PlayerCardHandData,
        CardGameDataType extends CardGameData>
    extends PlayerDataHandler<PlayerCardHandDataType, CardGameDataType>
{
    dealButton: MenuButton | null = null;
    hideShowCardButton: MenuButton | null = null;
    cards: Cards;
    scene: PlayerScene;
    moveToHandTime: number = .2;
    moveToPickUpTime: number = .05;
    allowedPickUpCardAmount = 0;
    allowedDropCardAmount = 0;

    tablePosition: Transform;
    pickUpAndPlaceBasePosition: Transform;
    handBasePosition: Transform;

    showCardsInHand = true;

    cardBasePositions: Transform[] = [];

    constructor(scene: PlayerScene) {
        super(scene);
        this.scene = scene;
        this.cards = new Cards(scene);
        const screenCenter = getScreenCenter(scene);
        this.tablePosition = { x: screenCenter.x, y: 0 - 500, rotation: DegreesToRadians(90), scale: .5 };
        this.pickUpAndPlaceBasePosition = {
            x: screenCenter.x,
            y: screenCenter.y - 400,
            rotation: 0,
            scale: 1.3
        };
        this.handBasePosition = {
            x: screenCenter.x,
            y: screenCenter.y,
            rotation: 0,
            scale: 2
        };
        this.cardBasePositions.push(this.tablePosition);
        this.cardBasePositions.push(this.handBasePosition);
        this.cardBasePositions.push(this.pickUpAndPlaceBasePosition);
    }

    // ------------------------------------ Data ------------------------------------
    override getPlayerDataToSend(): Partial<PlayerCardHandDataType> | undefined {
        // Add the data that needs to be sent over.
        const playerData = this.playerData;
        if (persistentData.myUserId === null) return;
        const userId = persistentData.myUserId;
        playerData.cardIds = this.cards.getPlayerCardsIds(userId)
        return playerData;
    }

    override onPlayerDataReceived(playerData: Partial<PlayerCardHandDataType>, gameData: Partial<CardGameDataType> | null): void {
        if (!playerData) return;
        if (playerData === undefined) return;

        // move the cards to the hand
        // TODO change the Date.now() to the time given to the user
        this.updateCardsInHand(playerData);

        this.updatePickUpFaceDownCards(playerData);
        this.updatePickUpFaceUpCards(playerData);

        this.updatePickUpCards(playerData);
    }

    updatePickUpCards(playerData: Partial<PlayerCardHandDataType>) {
        if (playerData.pickUpFaceUpCardIds === undefined) {
            // remove all pickUpFaceUpCards
            this.cards.cardContainers.forEach(card => {
                if (card.isPickUpFaceUpCard()) {
                    this.putCardBackOnTable(card);
                }
            });
        }
        if (playerData.pickUpFaceDownCardIds === undefined) {
            // remove all pickUpFaceDownCards
            this.cards.cardContainers.forEach(card => {
                if (card.isPickUpFaceDownCard()) {
                    this.putCardBackOnTable(card);
                }
            });
        }
        // return if both undefined
        if (playerData.pickUpFaceUpCardIds === undefined && playerData.pickUpFaceDownCardIds === undefined) return;
        // Check if pickUpTo is a number
        if (typeof playerData.pickUpTo !== 'number') return;
        if (this.cardsInHand().length < playerData.pickUpTo) {
            this.allowedPickUpCardAmount = playerData.pickUpTo - this.cardsInHand().length;
        }
        // check if dropTo is a number
        this.updateAllowedDropCardAmount(playerData);

        // update pick up face down cards
        (() => {
            if (playerData.pickUpFaceDownCardIds === undefined) return;
            // remove cards that are not in the list
            this.cards.cardContainers.forEach(card => {
                if (card.isPickUpFaceDownCard() && !playerData.pickUpFaceDownCardIds?.includes(card.id)) {
                    this.putCardBackOnTable(card);
                }
            });
            if (this.cardsInHand().length < playerData.pickUpTo) {
                this.setCardsToPickUp(playerData.pickUpFaceDownCardIds, false, 0);
            }
        })();

        // update pick up face up cards
        (() => {
            if (playerData.pickUpFaceUpCardIds === undefined) return;
            // remove cards that are not in the list
            this.cards.cardContainers.forEach(card => {
                if (card.isPickUpFaceUpCard() && !playerData.pickUpFaceUpCardIds?.includes(card.id)) {
                    this.putCardBackOnTable(card);
                }
            });
            if (this.cardsInHand().length < playerData.pickUpTo) {
                this.setCardsToPickUp(playerData.pickUpFaceUpCardIds, true, 1000);
            }
        })();

    }

    updateAllowedDropCardAmount(playerData: Partial<PlayerCardHandDataType>) {
        const dropTo = playerData.dropTo;
        // check if dropTo is a number
        if (typeof dropTo !== 'number') return;
        if (this.cardsInHand().length > dropTo) {
            this.allowedDropCardAmount = this.cardsInHand().length - dropTo;
        }
    }

    updateCardsInHand(playerData: Partial<PlayerCardHandDataType>) {
        if (playerData.cardIds === undefined) return;
        const cardIds = playerData.cardIds;
        const myUserId = persistentData.myUserId;
        // get all cards that need to be put in the hand
        const cardsInHand = this.cardsInHand();
        const cardsInHandIds = cardsInHand.map(card => card.id);
        const cardsToMoveToHand = cardIds.filter(cardId => !cardsInHandIds.includes(cardId));
        const currentTime = Date.now();
        cardsToMoveToHand.forEach((cardId, index) => {
            const card = this.cards.getCard(cardId);
            if (!card) throw new Error('card not found');
            // set the x position of the card + index
            card.x = card.x + index * 50;

            card.setUserHand(myUserId, currentTime);
            // move the card to the player hand
            card.setFaceUp(this.showCardsInHand);
        });
        // for each card in hand that is not in the cardIds array, set it to not in hand
        this.cards.cardContainers.forEach(card => {
            if (!cardIds.includes(card.id) && card.userHandId === myUserId) {
                this.putCardBackOnTable(card);
            }
        });
    }

    updatePickUpFaceDownCards(playerData: Partial<PlayerCardHandDataType>) {
        if (playerData.pickUpFaceDownCardIds === undefined) return;
        // Check if pickUpTo is a number
        if (typeof playerData.pickUpTo !== 'number') return;
        if (this.cardsInHand().length < playerData.pickUpTo) {
            this.setCardsToPickUp(playerData.pickUpFaceDownCardIds, false, 0);
        }
    }

    updatePickUpFaceUpCards(playerData: Partial<PlayerCardHandDataType>) {
        if (playerData.pickUpFaceUpCardIds === undefined) return;
        // Check if pickUpTo is a number
        if (typeof playerData.pickUpTo !== 'number') return;
        if (this.cardsInHand().length < playerData.pickUpTo) {
            this.setCardsToPickUp(playerData.pickUpFaceUpCardIds, true, 1000);
        }
    }

    override getGameDataToSend(): Partial<CardGameDataType> | undefined {
        return this.gameData;
    }

    override onGameDataReceived(gameData: Partial<CardGameDataType>): void {
        this.updateDealing(gameData);
    }

    updateDealing(gameData: Partial<CardGameDataType>) {
        if (!gameData) return;
        if (gameData.playerDealerId === undefined) return
        if (gameData.waitingForDeal === undefined) return
        const meDealing = gameData.playerDealerId === persistentData.myUserId && gameData.waitingForDeal;
        this.dealButton?.setVisible(meDealing);
    }
    // ------------------------------------ Data End ------------------------------------

    cardsInHand() {
        const userId = persistentData.myUserId;
        if (!userId) return [];
        return this.cards.getPlayerCards(userId);
    }

    create() {
        super.create();
        // ask for my current data
        this.cards.create(0, 0);
        this.cards.cardContainers.forEach(card => {
            card.setTransform(this.tablePosition);
            card.setInteractive();
            this.scene.input.setDraggable(card);

            this.scene.input.on('drag', (pointer: any, gameObject: CardContainer, dragX: number, dragY: number) => {
                if (gameObject.cardBackOnTable) return;
                gameObject.x = dragX;
                gameObject.y = dragY;

            });
            // on drag start set dragging true
            this.scene.input.on('dragstart', (pointer: any, gameObject: CardContainer) => {
                gameObject.beforeDraggedTransform = {
                    x: gameObject.x,
                    y: gameObject.y,
                    rotation: gameObject.rotation,
                    scale: gameObject.scale
                };
                gameObject.isDragging = true;
                gameObject.depth = 2;
                gameObject.moveOnDuration = null;
            });
            // on drag end set dragging false
            this.scene.input.on('dragend', (pointer: any, gameObject: CardContainer) => {
                gameObject.isDragging = false;
                this.checkIfMoveCardToHand(gameObject);
                this.checkIfMoveCardToTable(gameObject);
            });
        });

        // create deal button
        const screenDimensions = getScreenDimensions(this.scene);
        this.dealButton = new MenuButton(screenDimensions.width / 2, 100, this.scene);
        this.dealButton.setInteractive();
        this.dealButton.setText('DEAL');
        this.dealButton.on('pointerdown', () => {
            this.dealButton?.setVisible(false);
            this.gameData.startDealing = true;
            this.sendGameData(true);
        });
        this.dealButton.setVisible(false);
        this.scene.add.existing(this.dealButton);

        // create hide card/ show card button
        this.hideShowCardButton = new MenuButton(200, screenDimensions.height - 200, this.scene);
        this.hideShowCardButton.setInteractive();
        this.hideShowCardButton.setText('HIDE CARDS');
        this.hideShowCardButton.setStyle({
            fontSize: '40px',
            strokeThickness: 2
        });
        this.hideShowCardButton.on('pointerdown', () => {
            this.showCardsInHand = !this.showCardsInHand;
            this.hideShowCardButton?.setText(this.showCardsInHand ? 'HIDE CARDS' : 'SHOW CARDS');
            this.cardsInHand().forEach(card => {
                card.setFaceUp(this.showCardsInHand);
            });
        });
        this.scene.add.existing(this.hideShowCardButton);
    }

    setCardsToPickUp(cardIds: number[], faceUp: boolean, order: number) {
        // set cards that can be taken from table and match the faceup to be set back to table
        cardIds.forEach((cardId, i) => {
            const card = this.cards.getCard(cardId);
            if (!card) throw new Error('card not found');
            card.order = order + i;
            card.setFaceUp(faceUp);
            card.canTakeFromTable = true;
            card.removeFromHand();
            card.cardBackOnTable = false;
        });
    }

    calculateCardPrefferedPositions(cards: CardContainer[], transform: Transform) {
        if (cards.length === 0) return [];
        const cardWidth = cards[0].width * cards[0].scaleX;

        const screenDimensions = getScreenDimensions(this.scene);
        const distanceBetweenCards = Math.min((screenDimensions.width - 200) / cards.length, cardWidth);
        // get the card prefered positions
        const cardPositions = cards.map((card, index) => {
            const x = transform.x - ((cards.length - 1) / 2) * distanceBetweenCards + (index * distanceBetweenCards);
            const y = transform.y;
            return { x, y, rotation: 0, scale: transform.scale };
        });
        return cardPositions;
    }

    startMovingCardsInHandToPrefferedPosition() {
        const cards = this.cardsInHand();
        const cardPositions = this.calculateCardPrefferedPositions(cards, this.handBasePosition);
        cards.sort((a, b) => {
            if (a.timeGivenToUser !== b.timeGivenToUser) {
                // if not in userHand yet then move to bottom
                if (!a.inUserHand && b.inUserHand) {
                    return 1;
                }
                if (a.inUserHand && !b.inUserHand) {
                    return -1;
                }
            }
            if (!a.inUserHand && !b.inUserHand) {
                // if not moving yet then move to bottom
                return a.timeGivenToUser - b.timeGivenToUser;
            }
            return a.x - b.x;
        }).forEach((card, index) => {
            // do not start new movement if old movement already going to same position
            if (card.moveOnDuration?.endTransform && checkTransformsAlmostEqual(card.moveOnDuration.endTransform, cardPositions[index])) return;
            // do not start moving if the card is already in the right position
            if (checkTransformsAlmostEqual(card, cardPositions[index])) {
                this.setCardInHand(card);
                return;
            }
            // do not start moving the card if it is being dragged
            if (card.isDragging) return;

            card.startMovingOverTimeTo(cardPositions[index], this.moveToHandTime, () => {
                this.setCardInHand(card);
            });
            card.depth = index / cards.length;
        });
    }

    setCardInHand(card: CardContainer) {
        if (!card.inUserHand) {
            card.timeInHand = Date.now();
            card.inUserHand = true;
        }
    }

    startMovingCardsToPickUpToPrefferedPosition() {
        const cards = this.cardToPickUp();
        const cardPositions = this.calculateCardPrefferedPositions(cards, this.pickUpAndPlaceBasePosition);
        cards.sort((a, b) => {
            return a.order - b.order;
        }).forEach((card, index) => {
            // do not start new movement if old movement already going to same position
            if (card.moveOnDuration?.endTransform && checkTransformsAlmostEqual(card.moveOnDuration.endTransform, cardPositions[index])) return;
            // do not start moving if the card is already in the right position
            if (checkTransformsAlmostEqual(card, cardPositions[index])) return;
            // do not start moving the card if it is being dragged
            if (card.isDragging) return;
            card.startMovingOverTimeTo(cardPositions[index], this.moveToPickUpTime, () => { });
            card.depth = index / cards.length;
        });
    }

    cardToPickUp() {
        return this.cards.cardContainers.filter(card => card.canTakeFromTable);
    }

    // move dragged card to player hand if being dragged down
    checkIfMoveCardToHand(draggedCard: CardContainer) {
        // check if the card is lower than the starting drag position
        if (this.allowedPickUpCardAmount <= 0) return;
        if (!draggedCard.canTakeFromTable) return;
        if (draggedCard.beforeDraggedTransform === null) return;
        if (draggedCard.y < draggedCard.beforeDraggedTransform.y) return;
        draggedCard.setFaceUp(this.showCardsInHand);
        draggedCard.userHandId = persistentData.myUserId;
        draggedCard.canTakeFromTable = false;
        draggedCard.timeGivenToUser = Date.now();
        draggedCard.timeInHand = Date.now();
        this.setAllowedPickUpCardAmount(this.allowedPickUpCardAmount - 1);
        this.sendData();
    }

    setAllowedPickUpCardAmount(amount: number) {
        this.allowedPickUpCardAmount = amount;
        if (amount === 0) {
            // put all the pickupable cards back to the table
            this.cardToPickUp().forEach(card => {
                this.putCardBackOnTable(card);
            });
            this.onAllCardsPickedUp();
        }
    }

    startMovingCardsBackToTable() {
        const cards = this.cards.cardsInDeck();
        cards.forEach(card => {
            if (card.moveOnDuration) return;
            card.startMovingOverTimeTo(this.tablePosition, 1);
        });
    }

    checkIfMoveCardToTable(card: CardContainer) {
        if (card.beforeDraggedTransform === null) return;
        if (card.y > card.beforeDraggedTransform?.y) return;
        if (card.cardBackOnTable) return;
        if (!card.userHandId) return;
        if (this.allowedDropCardAmount <= 0) return;
        // check if the card was not just put in hand
        if (card.timeInHand && Date.now() - card.timeInHand < 100) return;

        // tell host to move the card to the table
        this.allowedDropCardAmount -= 1;
        this.putCardBackOnTable(card);
    }

    putCardBackOnTable(card: CardContainer) {
        card.removeFromHand();
        card.canTakeFromTable = false;
        card.cardBackOnTable = true;
        this.sendData();
    }

    update(time: number, delta: number) {
        this.cards.update(time, delta);
        this.startMovingCardsInHandToPrefferedPosition();
        this.startMovingCardsToPickUpToPrefferedPosition();
        this.startMovingCardsBackToTable();
    }


    abstract onAllCardsPickedUp(): void
}