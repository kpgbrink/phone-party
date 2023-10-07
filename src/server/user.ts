import { allRaces, nameByRace } from 'fantasy-name-generator';
import { HostUser, RoomData, User } from '../shared/Types';
import { getGameFromName } from '../shared/gamesList';

const rooms: Map<string, RoomData> = new Map();

export const addUserToRoom = (upsertingUser: User) => {
    upsertingUser.name = upsertingUser.name.trim();
    if (upsertingUser.name === '') {
        upsertingUser.name = (() => {
            const allRacesList = [...allRaces.racesWithGender, ...allRaces.otherRaces];
            const gender: "male" | "female" = (() => {
                const randomNumber = Math.random();
                if (randomNumber <= .5) {
                    return "male";
                }
                return "female";
            })();
            const newName = nameByRace(allRacesList[Math.floor(Math.random() * allRacesList.length)], { gender: gender, allowMultipleNames: false });
            if (typeof newName !== 'string') throw newName;
            // replace spaces with underscores and - with underscores
            return newName.replace(/ /g, '_').replace(/-/g, '_');
        })();
    };

    const user: User = upsertingUser;

    const roomData = rooms.get(user.room);
    if (roomData) {
        roomData.users = roomData.users.filter(u => u.id !== user.id);
        roomData.users.push(user);
    }
    return user;
}

export const addHostUserToRoom = (hostUser: User) => {
    const roomData = rooms.get(hostUser.room);
    // if room exists just add it to hostUser
    if (roomData) {
        roomData.hostUser = hostUser;
    }
    // add room if it doesn't exist yet
    if (!rooms.has(hostUser.room)) {
        rooms.set(hostUser.room, {
            game: {
                currentPlayerScene: 'PlayerStartingScene',
                selectedGameSceneIndex: 0,
                selectedGameName: null,
            },
            room: hostUser.room, users: [], hostUser: hostUser,
        });
    }
    return hostUser;
}

export const updateUser = (userUpdate: Partial<User>, user: User) => {
    // only update if user is in room
    const roomData = rooms.get(user.room);
    if (!roomData) {
        console.log('does not have room');
        return;
    }
    const foundUser = roomData.users.find(u => u.id === user.id);
    if (!foundUser) {
        console.log('does not have user');
        return;
    }
    Object.assign(foundUser, userUpdate);
}

export const removeUser = (userSocketSocketId: string, roomId: string) => {
    const room = getRoom(roomId);
    if (!room) {
        console.log('room does not exist');
        return;
    }
    const playerUser = room.users.find((user) => {
        return user.socketId === userSocketSocketId
    });
    const hostUser = (() => {
        if (room.hostUser?.socketId === userSocketSocketId) {
            return room.hostUser;
        }
        return null;
    })();

    if (playerUser) {
        deletePlayerUserFromRoom(playerUser, room);
    }
    if (hostUser) {
        deleteHostUserFromRoom(hostUser, room);
    }
}

const deleteHostUserFromRoom = (hostUser: HostUser, room: RoomData) => {
    // remove host user
    room.hostUser = null;
    console.log('deleting host user');
    checkIfShouldDeleteRoom(room);
}

const deletePlayerUserFromRoom = (playerUser: User, room: RoomData) => {
    // If the user is in game and the game is not leavable, keep the user in the game
    if (room.game.selectedGameName
        && getGameFromName(room.game.selectedGameName).leavable === false
        && playerUser.inGame) {
        console.log('user is in game that is not leavable so keep them in game');
        // remove the socket id from the user
        playerUser.socketId = null;
        playerUser.socketId = null;
        console.log('keeping user in game');
        checkIfShouldDeleteRoom(room);
        return;
    }
    console.log('deleting player user');
    // remove user from room map
    if (room) {
        room.users = room.users.filter((user) => {
            return user.socketId !== playerUser.socketId;
        });
    }
    checkIfShouldDeleteRoom(room);
}

// delete room if no users or all users have no socket id
const checkIfShouldDeleteRoom = (room: RoomData) => {
    // delete room if no users or all users have no socket id, and no host user
    if (room.hostUser === null &&
        (room.users.length === 0 || room.users.every((user) => user.socketId === null))
    ) {
        rooms.delete(room.room);
        console.log('all existing rooms count ', rooms.size);
        console.log('all existing rooms', rooms);
    }
}

export const removeAllUsersWithoutSocketId = (roomId: string) => {
    // remove all users without socket id
    const room = getRoom(roomId);
    if (!room) return;
    room.users = room.users.filter((user) => {
        return user.socketId !== null;
    });
    checkIfShouldDeleteRoom(room);
}

// get room
export const getRoom = (roomId: string) => {
    const room = rooms.get(roomId);
    return room;
}

export const getRoomHost = (room: string) => {
    const roomData = getRoom(room);
    if (!roomData) return;
    return roomData.hostUser;
}

export const getRoomHostSocketId = (room: string) => {
    return getRoomHost(room)?.socketId;
}