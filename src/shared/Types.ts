
export interface NewRoomId {
    roomId: string;
}

export interface NewUserId {
    userId: string;
}

export interface UserAvatar {
    // Index of image in avatar Images
    base: number; // The base image
    beard: number; // The beard image
    body: number; // The body image
    cloak: number; // The cloak image
    gloves: number; // The gloves image
    boots: number; // The boots image
    hair: number; // The hair image
    head: number; // The head image
    legs: number; // The legs image
}

export interface UserBase {
    id: string;
    socketId: string | null;
    room: string;
}

export interface HostUser extends UserBase {

}

export interface User extends UserBase {
    name: string;
    userColor: string | null;
    userAvatar: UserAvatar | null;
    rotation: number | null;
    inGame: boolean;
    hasSetName: boolean;
}

export interface Game {
    currentPlayerScene: string | null;
    selectedGameSceneIndex: number;
    selectedGameName: string | null;
}

export interface RoomData {
    room: string;
    hostUser: User | null;
    users: User[];
    game: Game;
}

export interface StoredBrowserIds {
    localStorage: {
        socketId: string | null;
        userId: string | null;
    };
    sessionStorage: {
        socketId: string | null;
        userId: string | null;
    };
}
