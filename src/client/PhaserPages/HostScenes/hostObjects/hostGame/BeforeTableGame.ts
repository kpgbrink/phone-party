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


    calculateRotations() {
        // set num points to number of players + 2
        if (!persistentData.roomData) throw new Error('Room data not found');
        const numPoints = persistentData.roomData?.users.length + 2;
        const angleIncrement = (2 * Math.PI) / numPoints;
        const tableRotations: number[] = [];

        for (let i = 0; i < numPoints; i++) {
            tableRotations.push(i * angleIncrement);
        }

        return tableRotations;
    }

    constructor(scene: HostBeforeTableGameScene) {
        super(scene);
        this.scene = scene;
        this.gameData = new BeforeTableGameData();
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
        const { angle, locationIndex } = playerData;
        const numLocations = this.calculateRotations().length;
        const newLocationIndex = (locationIndex + direction + numLocations) % numLocations;
        const newAngle = this.calculateRotations()[newLocationIndex];

        // Check for collisions with other players at the new location
        const isCollision = this.isCollisionAtLocation(newAngle);
        if (isCollision) {
            // Handle collision by displacing the other player
            const otherPlayer = this.findPlayerAtLocation(clientId, newAngle);
            if (otherPlayer) {
                // Swap positions of the current player and the other player
                this.swapPlayerLocations(clientId, otherPlayer.user.id);
            }
        }

        this.playerSelectedLocations[clientId] = { angle: newAngle, locationIndex: newLocationIndex };

        // Update the player's location
        const screenCenter = getScreenCenter(this.scene);
        const vectorFromCenter = vectorFromAngleAndLength(newAngle, 20);
        const x = screenCenter.x + vectorFromCenter.x;
        const y = screenCenter.y + vectorFromCenter.y;
        const avatar = this.hostUserAvatars?.userAvatarContainers.find((avatar) => avatar.user.id === clientId);
        if (avatar) {
            avatar.setPosition(x, y);
        }
    }

    // Function to check for collisions at a specific location
    isCollisionAtLocation(angle: number): boolean {
        const clientId = ""; // Replace with the actual clientId
        const playerAtLocation = this.hostUserAvatars?.userAvatarContainers.find((avatar) => {
            if (avatar.user.id !== clientId) { // Exclude the current player
                const vectorFromCenter = vectorFromAngleAndLength(angle, 20);
                const screenCenter = getScreenCenter(this.scene);
                const x = screenCenter.x + vectorFromCenter.x;
                const y = screenCenter.y + vectorFromCenter.y;
                const distance = Math.sqrt(Math.pow(x - avatar.x, 2) + Math.pow(y - avatar.y, 2));
                return distance < avatar.width; // Adjust this value as needed to define the collision radius
            }
            return false;
        });

        return playerAtLocation !== undefined;
    }

    findPlayerAtLocation(clientId: string, angle: number): any | null {
        const playerAtLocation = this.hostUserAvatars?.userAvatarContainers.find((avatar) => {
            if (avatar.user.id !== clientId) { // Exclude the current player
                const vectorFromCenter = vectorFromAngleAndLength(angle, 20);
                const screenCenter = getScreenCenter(this.scene);
                const x = screenCenter.x + vectorFromCenter.x;
                const y = screenCenter.y + vectorFromCenter.y;
                const distance = Math.sqrt(Math.pow(x - avatar.x, 2) + Math.pow(y - avatar.y, 2));
                return distance < avatar.width; // Adjust this value as needed to define the collision radius
            }
            return false;
        });

        return playerAtLocation || null;
    }

    // Function to swap positions of two players
    swapPlayerLocations(playerId1: string, playerId2: string) {
        const player1Data = this.playerSelectedLocations[playerId1];
        const player2Data = this.playerSelectedLocations[playerId2];

        if (!player1Data || !player2Data) return;

        // Swap their positions
        this.playerSelectedLocations[playerId1] = { angle: player2Data.angle, locationIndex: player2Data.locationIndex };
        this.playerSelectedLocations[playerId2] = { angle: player1Data.angle, locationIndex: player1Data.locationIndex };

        // Update their positions on the screen
        const screenCenter = getScreenCenter(this.scene);
        const vectorFromCenter1 = vectorFromAngleAndLength(player2Data.angle, 20);
        const vectorFromCenter2 = vectorFromAngleAndLength(player1Data.angle, 20);
        const x1 = screenCenter.x + vectorFromCenter1.x;
        const y1 = screenCenter.y + vectorFromCenter1.y;
        const x2 = screenCenter.x + vectorFromCenter2.x;
        const y2 = screenCenter.y + vectorFromCenter2.y;
        const avatar1 = this.hostUserAvatars?.userAvatarContainers.find((avatar) => avatar.user.id === playerId1);
        const avatar2 = this.hostUserAvatars?.userAvatarContainers.find((avatar) => avatar.user.id === playerId2);

        if (avatar1 && avatar2) {
            avatar1.setPosition(x1, y1);
            avatar2.setPosition(x2, y2);
        }
    }
} 