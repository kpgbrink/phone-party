

export class HostPersistantData {
    constructor() {
        this.userIdsInGame = [];
    }

    public userIdsInGame: string[];
}

export const hostPersistantData: HostPersistantData = new HostPersistantData();