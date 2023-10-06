import GenericItemContainer from "./GenericItemContainer";


export default class PlayerTurnIndicator extends GenericItemContainer {

    public update(time: number, delta: number) {
        // slow heart beat 
        super.update(time, delta);
        const newScale = 1 + Math.sin(time / 1000) / 40;
        this.image?.setScale(newScale);

    }
}