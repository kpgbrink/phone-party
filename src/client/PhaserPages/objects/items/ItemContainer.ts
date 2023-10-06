import { CountdownTimer } from "../CountdownTimer";
import { calculateMovementFromTimer, IMoveItemOverTime, ITableItem, millisecondToSecond, Transform } from "../Tools";

export default class ItemContainer extends Phaser.GameObjects.Container implements ITableItem {
    velocity: { x: number, y: number, rotation: number } = { x: 0, y: 0, rotation: 0 };
    mass: number = 1;

    userHandId: string | null = null;
    inUserHand: boolean = false;
    timeGivenToUser: number = 0;

    moveOnDuration: IMoveItemOverTime | null = null;

    canTakeFromTable: boolean = false;
    cardBackOnTable: boolean = false;

    beforeDraggedTransform: Transform | null = null;
    isDragging: boolean = false;
    order: number = 0;

    public removeFromHand() {
        this.userHandId = null;
        this.inUserHand = false;
    }

    public setUserHand(userHandId: string | null, timeGivenToUser: number | null = null) {
        if (this.userHandId === userHandId) return; // already in user hand
        this.userHandId = userHandId;
        // if timeGivenToUser is null then don't change the time given to user
        if (timeGivenToUser !== null) {
            this.timeGivenToUser = timeGivenToUser;
        }
        this.canTakeFromTable = false;
        this.cardBackOnTable = false;
    }

    public startMovingOverTimeTo(toPosition: Transform, time: number, onMovementEndCallBack?: () => void) {
        this.velocity = { x: 0, y: 0, rotation: 0 };
        this.moveOnDuration = {
            movementCountdownTimer: new CountdownTimer(time),
            startPosition: { x: this.x, y: this.y, rotation: this.rotation, scale: this.scale },
            endTransform: toPosition,
            onMovementEndCallBack: onMovementEndCallBack || null
        };
    }

    public moveOverTime(time: number, delta: number) {
        if (!this.moveOnDuration) return;
        if (this.moveOnDuration.movementCountdownTimer.wasDone()) {
            const moveOnDurationCallback = this.moveOnDuration.onMovementEndCallBack;
            this.moveOnDuration = null;
            if (moveOnDurationCallback) {
                moveOnDurationCallback();
            }
            return;
        }
        const movement = calculateMovementFromTimer(
            this.moveOnDuration.movementCountdownTimer,
            delta,
            this.moveOnDuration.startPosition,
            this,
            this.moveOnDuration.endTransform
        );
        this.x += movement.x;
        this.y += movement.y;
        this.rotation += movement.rotation;
        this.scale += movement.scale;
        this.moveOnDuration.movementCountdownTimer.update(delta);
    }

    public moveFromVelocity(delta: number) {
        this.x += this.velocity.x * millisecondToSecond(delta);
        this.y += this.velocity.y * millisecondToSecond(delta);
        this.rotation += this.velocity.rotation * millisecondToSecond(delta);
    }

    public setTransform(transform: Transform) {
        this.x = transform.x;
        this.y = transform.y;
        this.rotation = transform.rotation;
        this.scale = transform.scale;
    }

    public update(time: number, delta: number) {
        this.moveOverTime(time, delta);
        this.moveFromVelocity(delta);
    }
}