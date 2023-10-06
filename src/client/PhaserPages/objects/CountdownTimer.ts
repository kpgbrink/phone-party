import { millisecondToSecond } from "./Tools";


// Create a new Timer object.
export class CountdownTimer {
    startTime: number;
    currentTime: number;
    previousTime: number;
    paused: boolean = false;

    constructor(startTime: number, autoStart: boolean = true) {
        this.startTime = startTime;
        this.currentTime = startTime;
        this.previousTime = startTime;
        if (autoStart) {
            this.start();
        }
    }

    start() {
        this.paused = false;
        this.currentTime = this.startTime;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    update(delta: number) {
        this.previousTime = this.currentTime;
        if (this.paused) {
            return;
        }
        this.currentTime -= millisecondToSecond(delta);
        if (this.currentTime <= 0) {
            this.currentTime = 0;
            this.paused = true;
        }
    }

    isDone() {
        return this.currentTime <= 0;
    }

    wasDone() {
        return this.previousTime <= 0;
    }

    getTimePassed() {
        return this.startTime - this.currentTime;
    }

    getTimePassedPercentage() {
        return this.getTimePassed() / this.startTime;
    }
}