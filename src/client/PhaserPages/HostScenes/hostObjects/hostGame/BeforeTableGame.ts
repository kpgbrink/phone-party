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

    static calculateRotations(numPoints) {
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
        const tableRotations = BeforeTableGame.calculateRotations(persistentData.roomData?.users.length + 2);
        tableRotations.forEach((rotation) => {
            const vectorFromCenter = vectorFromAngleAndLength(rotation, 20);
rotation
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
            avatar.rotation -= Math.PI / 2;
            avatar.tableRotation -= Math.PI / 2;
            avatar.setPosition(3, 5);
        }
        if (input.right) {
            avatar.rotation += Math.PI / 2;
            avatar.setPosition(599, 5);
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
} 