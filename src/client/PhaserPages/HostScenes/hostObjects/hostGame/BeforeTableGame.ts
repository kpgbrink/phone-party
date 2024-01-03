import { BeforeTableGameData, PlayerBeforeTableGameData } from "../../../../../shared/data/datas/BeforeTableGameData";
import socket from "../../../../SocketConnection";
import GameTable from "../../../objects/GameTable";
import { persistentData } from "../../../objects/PersistantData";
import { getScreenCenter, loadIfImageNotLoaded, playersInRoom, vectorFromAngleAndLength } from "../../../objects/Tools";
import HostBeforeTableGameScene from "../../HostBeforeTableGameScene";
import { calculateDistanceAndRotationFromTable } from "../../hostTools/HostTools";
import { HostGame } from "../HostGame";
import { HostUserAvatarsAroundTableSelectPosition } from "../HostUserAvatars/HostUserAvatarsAroundTable/HostUserAvatarsAroundTableSelectPosition";



export class BeforeTableGame extends HostGame<PlayerBeforeTableGameData, BeforeTableGameData> {
    scene: HostBeforeTableGameScene;
    gameData: BeforeTableGameData;
    gameTable: GameTable | null = null;

    hostUserAvatars: HostUserAvatarsAroundTableSelectPosition | null = null;

    playerSelectedLocations: Record<string, { angle: number, locationIndex: number }> = {}; // Store selected locations and starting angles for each player

    constructor(scene: HostBeforeTableGameScene) {
        super(scene);
        this.scene = scene;
        this.gameData = new BeforeTableGameData();
    }

    calculateRotations() {
        // set num points to number of players + 2
        if (!persistentData.roomData) throw new Error('Room data not found');
        const numPoints = (() => {
            const usersInGame = persistentData.roomData.users.filter(u => u.inGame).length;
            const numPoints = usersInGame + 2;
            // round up to nearest even number
            return Math.ceil(numPoints / 2) * 2;
        })();
        const angleIncrement = (2 * Math.PI) / numPoints;
        const tableRotations: number[] = [];

        for (let i = 0; i < numPoints; i++) {
            tableRotations.push(i * angleIncrement);
        }

        return tableRotations;
    }

    preload() {
        super.preload();
        loadIfImageNotLoaded(this.scene, 'checkmark', 'assets/ui/checkmark.png');
        loadIfImageNotLoaded(this.scene, 'table', 'assets/tableGames/TableScaled.png');
        loadIfImageNotLoaded(this.scene, 'positionIndicator', 'assets/tableGames/PlayerPickPosition.png'); // Load your indicator image
    }

    create() {
        super.create();
        this.createHostUserAvatarsAroundTableGame();
        const screenCenter = getScreenCenter(this.scene);
        this.gameTable = new GameTable(this.scene, screenCenter.x, screenCenter.y);
        this.gameTable.setDepth(-1);
        this.sendDataToAll();
        this.makeTableLocationsSelectable();
        this.setupPlayerStartingLocations();
    }

    makeTableLocationsSelectable() {
        // create a table location selectable for the 8 positions selectable
        const screenCenter = getScreenCenter(this.scene);
        // make 2 more table locations than number of players
        if (!persistentData.roomData) throw new Error('Room data not found');
        const tableRotations = this.calculateRotations();
        tableRotations.forEach((rotation) => {
            const vectorFromCenter = vectorFromAngleAndLength(rotation, 20);
            // move the vectors from center to edge of table
            // Calculate the distance and rotation from the table for the current rotation
            const { maxDistance, positionAngle } = calculateDistanceAndRotationFromTable(this.scene, {
                x: screenCenter.x + vectorFromCenter.x,
                y: screenCenter.y + vectorFromCenter.y,
            });

            // put distance using the maxDistance and position angle from the center of the screen
            vectorFromCenter.x = maxDistance * Math.cos(rotation);
            vectorFromCenter.y = maxDistance * Math.sin(rotation);

            const x = screenCenter.x + vectorFromCenter.x;
            const y = screenCenter.y + vectorFromCenter.y;
            const tableLocation = this.scene.add.image(x, y, 'positionIndicator');
            tableLocation.rotation = positionAngle;
            this.scene.add.existing(tableLocation);
        });
    }

    setupPlayerStartingLocations() {
        if (!persistentData.roomData) throw new Error('Room data not found');
        const screenCenter = getScreenCenter(this.scene);

        // Calculate table rotations
        let availableRotations = this.calculateRotations();

        // Initialize playerSelectedLocations
        this.playerSelectedLocations = {};

        // Create an array of users with their current rotation and a flag indicating if they have been positioned
        let usersWithRotations = persistentData.roomData.users.map(user => {
            const userAvatar = this.hostUserAvatars?.userAvatarContainers.find(avatar => avatar.user.id === user.id);
            return { userAvatar, currentRotation: userAvatar ? userAvatar.tableRotation : 0, isPositioned: false };
        });

        while (usersWithRotations.some(user => !user.isPositioned)) {
            usersWithRotations.forEach(user => {
                if (!user.isPositioned) {
                    // Find the closest rotation
                    const closestRotation = availableRotations.reduce((prev, curr) => {
                        return (Math.abs(curr - user.currentRotation) < Math.abs(prev - user.currentRotation) ? curr : prev);
                    });

                    // Assign the closest rotation
                    user.currentRotation = closestRotation;
                    user.isPositioned = true;

                    // Remove the assigned rotation from the available list
                    availableRotations = availableRotations.filter(rotation => rotation !== closestRotation);

                    // Update user avatar position and store in playerSelectedLocations
                    const vectorFromCenter = vectorFromAngleAndLength(closestRotation, 20);
                    if (user.userAvatar) {
                        user.userAvatar.tableRotation = closestRotation;
                        user.userAvatar.setPosition(screenCenter.x + vectorFromCenter.x, screenCenter.y + vectorFromCenter.y);
                        this.playerSelectedLocations[user.userAvatar.user.id] = {
                            angle: closestRotation,
                            locationIndex: availableRotations.length // or some other logic to determine the index
                        };
                    }
                }
            });

            // Sort users by those who are positioned
            usersWithRotations = usersWithRotations.sort((a, b) => a.isPositioned === b.isPositioned ? 0 : a.isPositioned ? -1 : 1);
        }
    }

    createHostUserAvatarsAroundTableGame() {
        this.hostUserAvatars = new HostUserAvatarsAroundTableSelectPosition(this.scene);
        this.hostUserAvatars.createOnRoomData();
        this.hostUserAvatars.moveToEdgeOfTable();
        this.hostUserAvatars.userAvatarContainers.forEach(player => {
            player.create();
            player.depth = 40;
        });
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.hostUserAvatars?.update(time, delta);
        this.moveUsersToOutsideTable();
    }

    moveUsersToOutsideTable() {
        this.hostUserAvatars?.moveToEdgeOfTable();
        this.hostUserAvatars?.userAvatarContainers.forEach((userAvatar) => {
            // update the avatar rotations to server if changed
            // but don't make the update send things out to everyone else because it doesn't really matter to the others atm.
            (() => {
                const user = persistentData.roomData?.users.find((user) => user.id === userAvatar.user.id);
                if (!user) return;
                if (user.rotation === userAvatar.tableRotation) return;
                socket.emit('set player rotation', userAvatar.user.id, userAvatar.tableRotation);
                user.rotation = userAvatar.tableRotation;
            })();
            // If user is ready then rotate the user
            // userAvatar.rotation += DegreesToRadians(180);
        });
    }

    // ------------------------------------ Data ------------------------------------
    override onPlayerDataReceived(userId: string, playerData: Partial<PlayerBeforeTableGameData>, gameData: Partial<BeforeTableGameData> | null): void {
        super.onPlayerDataReceived(userId, playerData, gameData);
        // update ready on the player
        const avatar = this.hostUserAvatars?.userAvatarContainers.find((avatar) => avatar.user.id === userId);
        if (!avatar) return;
        if (!playerData) return;
        if (playerData.ready) {
            avatar.setReady();
        }
        this.startGameIfAllReady();
    }

    override getPlayerDataToSend(userId: string): Partial<PlayerBeforeTableGameData> | undefined {
        // get the player data from userId
        const playerData = this.hostUserAvatars?.userAvatarContainers.find((avatar) => avatar.user.id === userId)?.beforeTableGamePlayerData;
        if (!playerData) return;
        return {
            ready: playerData.ready,
        };
    }

    override onInputReceived(clientId: string, input: any): void {
        super.onInputReceived(clientId, input);
        console.log('input received', input);
        // update the avatar rotation
        const avatar = this.hostUserAvatars?.userAvatarContainers.find((avatar) => avatar.user.id === clientId);
        if (!avatar) return;
        if (!input) return;
        if (input.left) {
            console.log('move left');
            // Move the selected location to the left
            this.moveSelectedLocation(clientId, -1);
        }
        if (input.right) {
            // Move the selected location to the right
            this.moveSelectedLocation(clientId, 1);
        }
    }

    startGameIfAllReady() {
        // If all users are ready then start the game
        const allReady = this.hostUserAvatars?.userAvatarContainers.every((avatar) => avatar.beforeTableGamePlayerData.ready);
        if (allReady) {
            this.startGame();
        }
    }

    startGame() {
        // All users in game
        const playersInGame = playersInRoom(persistentData.roomData);
        if (playersInGame.length === 0) return;
        this.scene.goToNextScene();
    }

    // Function to move the selected location for a player
    moveSelectedLocation(clientId: string, direction: number) {
        const playerData = this.playerSelectedLocations[clientId];
        if (!playerData) return;

        const tableRotations = this.calculateRotations();
        const numLocations = tableRotations.length;

        // Calculate new location index
        const newLocationIndex = (playerData.locationIndex + direction + numLocations) % numLocations;
        const newAngle = tableRotations[newLocationIndex];

        // Check for collision at the new location
        const otherPlayerId = this.findPlayerIdAtAngle(newAngle, clientId);
        if (otherPlayerId) {
            console.log('swap players', clientId, otherPlayerId);
            // Swap positions with the other player
            this.swapPlayerLocations(clientId, otherPlayerId);
        } else {
            // No collision, just move the player to the new location
            this.updatePlayerLocation(clientId, newAngle, newLocationIndex);
        }
    }

    findPlayerIdAtAngle(angle: number, excludingClientId: string): string | null {
        // Find if any player other than excludingClientId is at the given angle
        for (const [clientId, playerData] of Object.entries(this.playerSelectedLocations)) {
            if (clientId !== excludingClientId && playerData.angle === angle) {
                return clientId;
            }
        }
        return null;
    }

    updatePlayerLocation(clientId: string, angle: number, locationIndex: number) {
        // Update the location of the player
        console.log('update player location', clientId, angle, locationIndex);
        const screenCenter = getScreenCenter(this.scene);
        const vectorFromCenter = vectorFromAngleAndLength(angle, 200);
        const x = screenCenter.x + vectorFromCenter.x;
        const y = screenCenter.y + vectorFromCenter.y;
        const avatar = this.hostUserAvatars?.userAvatarContainers.find((avatar) => avatar.user.id === clientId);

        if (avatar) {
            avatar.setPosition(x, y);
        }
        this.playerSelectedLocations[clientId] = { angle, locationIndex };
    }

    swapPlayerLocations(playerId1: string, playerId2: string) {
        const player1Data = this.playerSelectedLocations[playerId1];
        const player2Data = this.playerSelectedLocations[playerId2];

        if (!player1Data || !player2Data) return;

        // Swap their angles and location indices
        [player1Data.angle, player2Data.angle] = [player2Data.angle, player1Data.angle];
        [player1Data.locationIndex, player2Data.locationIndex] = [player2Data.locationIndex, player1Data.locationIndex];

        // Update their positions on the screen
        this.updatePlayerPosition(playerId1, player1Data.angle, player1Data.locationIndex);
        this.updatePlayerPosition(playerId2, player2Data.angle, player2Data.locationIndex);
    }

    updatePlayerPosition(clientId: string, angle: number, locationIndex: number) {
        const screenCenter = getScreenCenter(this.scene);
        const vectorFromCenter = vectorFromAngleAndLength(angle, 20);
        const x = screenCenter.x + vectorFromCenter.x;
        const y = screenCenter.y + vectorFromCenter.y;
        const avatar = this.hostUserAvatars?.userAvatarContainers.find((avatar) => avatar.user.id === clientId);

        if (avatar) {
            avatar.setPosition(x, y);
        }
        this.playerSelectedLocations[clientId] = { angle, locationIndex };
    }
} 