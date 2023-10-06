import { ThirtyOnePlayerCardHandData } from "api/src/data/datas/cardHandDatas/ThirtyOneCardHandData";
import GenericItemContainer from "../../items/GenericItemContainer";
import { DegreesToRadians, getScreenCenter, randomizeTransform, transformFromObject, TransformRandomizer } from "../../Tools";
import { CardGameUserAvatarContainer } from "../CardGameUserAvatarContainer";

export class ThirtyOneUserAvatarContainer extends CardGameUserAvatarContainer<ThirtyOnePlayerCardHandData> {
    lives: number = 3;
    pokerChipsDistance: number = 160;
    bluePokerChips: GenericItemContainer[] = [];
    removingPokerChips: GenericItemContainer[] = [];
    roundScore: number = 0;

    playerCardHandData: ThirtyOnePlayerCardHandData = new ThirtyOnePlayerCardHandData();

    createPlayerCardHandData(): ThirtyOnePlayerCardHandData {
        return new ThirtyOnePlayerCardHandData();
    }

    create() {
        this.createPokerChipLives();
    }

    createPokerChipLives() {
        const screenCenter = getScreenCenter(this.scene);
        // put as many poker chips as lives in front of the user avatar
        for (let i = 0; i < this.lives; i++) {
            // add random position and rotation to the poker chip
            var randomX = Math.random() * 100 - 50;
            var randomY = Math.random() * 100 - 50;
            const pokerChip = new GenericItemContainer(this.scene, screenCenter.x + randomX, screenCenter.y + randomY, 'bluePokerChip');
            this.scene.add.existing(pokerChip);
            const x = i * this.pokerChipsDistance - this.pokerChipsDistance * (this.lives - 1) / 2;

            const pokerChipTransform = { x: x, y: 200, rotation: 0, scale: .4 };

            const newTransform = transformFromObject(this, pokerChipTransform);

            pokerChip.startMovingOverTimeTo(newTransform, 1, () => {
            });

            pokerChip.setDepth(this.depth + 1000);
            this.bluePokerChips.push(pokerChip);
        }
    }

    updatePokerChips() {
        // remove any poker chips that are not in the life anymore
        while (this.bluePokerChips.length > Math.max(this.lives, 0)) {
            const pokerChip = this.bluePokerChips.pop();
            if (pokerChip) {
                this.removingPokerChips.push(pokerChip);
                this.movePokerChipOffTableCooly(pokerChip);
            }
        }
    }

    movePokerChipOffTableCooly(pokerChip: GenericItemContainer) {
        const transformAboveHead = transformFromObject(this, { x: 0, y: -300, rotation: 0, scale: .8 });
        const transformHitPlayer = transformFromObject(this, { x: 0, y: 50, rotation: 0, scale: .2 });
        const transformOffTable = transformFromObject(this, { x: 0, y: 10000, rotation: 0, scale: .4 });
        const randomizedTransformAboveHead: TransformRandomizer = {
            magnitude: 200,
            rotation: DegreesToRadians(100),
            scale: .3,
        };
        const randomizedTransformHit: TransformRandomizer = {
            magnitude: 50,
            rotation: DegreesToRadians(30),
            scale: .1,
        };
        pokerChip.startMovingOverTimeTo(randomizeTransform(transformAboveHead, randomizedTransformAboveHead), 1, () => {
            pokerChip.startMovingOverTimeTo(randomizeTransform(transformHitPlayer, randomizedTransformHit), .5, () => {
                pokerChip.startMovingOverTimeTo(randomizeTransform(transformAboveHead, randomizedTransformAboveHead), 1, () => {
                    pokerChip.startMovingOverTimeTo(randomizeTransform(transformHitPlayer, randomizedTransformHit), .3, () => {
                        pokerChip.startMovingOverTimeTo(randomizeTransform(transformAboveHead, randomizedTransformAboveHead), 1, () => {
                            pokerChip.startMovingOverTimeTo(randomizeTransform(transformHitPlayer, randomizedTransformHit), .2, () => {
                                pokerChip.startMovingOverTimeTo(transformOffTable, 1, () => {
                                    this.removingPokerChips.splice(this.removingPokerChips.indexOf(pokerChip), 1);
                                    pokerChip.destroy();
                                });
                            });
                        });
                    });
                });
            });
        });

    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.bluePokerChips.forEach(pokerChip => {
            pokerChip.update(time, delta)
        });
        this.removingPokerChips.forEach(pokerChip => {
            pokerChip.update(time, delta)
        });
    }
}