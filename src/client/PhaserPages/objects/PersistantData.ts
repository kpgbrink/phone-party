import { RoomData } from "api";

// create class that stores persistent data between scenes
export class PersistantData {
    constructor() {
        this.roomData = null;
        this.myUserId = null;
    }

    public roomData: RoomData | null;

    public myUserId: string | null;
}

export const persistentData: PersistantData = new PersistantData();