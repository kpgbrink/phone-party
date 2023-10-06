import { RoomData } from "api";
import socket from "../../SocketConnection";
import { persistentData } from "../objects/PersistantData";
import { findMyUser, getScreenDimensions, loadIfSpriteSheetNotLoaded, makeMyUserAvatarInCenterOfPlayerScreen } from "../objects/Tools";
import { generateRandomUserAvatar, loadUserAvatarSprites } from "../objects/UserAvatarContainer";
import PlayerMenu from "./playerObjects/PlayerMenu";
import PlayerScene from "./playerObjects/PlayerScene";

export default class PlayerStartingScene extends PlayerScene {
  createMenuOnScene = false;
  returnKey: Phaser.Input.Keyboard.Key | undefined;

  playerMenu: PlayerMenu | null;
  nameFormElement: Phaser.GameObjects.DOMElement | null;

  // scaleTimer: CountdownTimer = new CountdownTimer(.5);

  constructor() {
    super({ key: 'PlayerStartingScene' });
    this.userAvatarContainer = null;
    this.playerMenu = null;
    this.nameFormElement = null;
  }

  preload() {
    super.preload();
    this.load.html('nameform', 'assets/text/nameform.html');
    loadIfSpriteSheetNotLoaded(this, 'fullscreen', 'assets/ui/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
    loadIfSpriteSheetNotLoaded(this, 'fullscreen-white', 'assets/ui/fullscreen-white.png', { frameWidth: 64, frameHeight: 64 });
  }

  create() {
    super.create();
    // this always has to run first
    generateRandomUserAvatar();
    loadUserAvatarSprites(this);
    makeMyUserAvatarInCenterOfPlayerScreen(this);
    this.setUpNameDisplayAndInput();
    this.playerMenu = new PlayerMenu(this);
    this.playerMenu.create();
    const onRoomData = (gameData: RoomData) => {
      this.handleNameStyleChange();
    };
    socket.on('room data', onRoomData);

    const cleanup = () => {
      socket.off('room data', onRoomData);
    }
    // on scene shutdown
    this.events.on('shutdown', () => {
      cleanup();
    });
    this.events.on('destroy', () => {
      cleanup();
    })
  }

  setUpNameDisplayAndInput() {
    var screenDimensions = getScreenDimensions(this);
    this.nameFormElement = this.add.dom(screenDimensions.width / 2, 650).createFromCache('nameform').setOrigin(0.5);
    if (!this.nameFormElement) return;
    const nameSend = () => {
      if (!this.nameFormElement) return;
      var inputText = this.nameFormElement.getChildByName('nameField') as HTMLInputElement;
      if (inputText.value === '') return;
      // remove trim
      inputText.value = inputText.value.trim();
      // set all spaces to -
      inputText.value = inputText.value.replace(/ /g, '-');
      // Remove all trailing spaces and _ characters
      inputText.value = inputText.value.replace(/-+$/, '');
      // Replace all - a characters with a single -
      inputText.value = inputText.value.replace(/-+/g, '-');
      // keep text only 10 characters long
      inputText.value = inputText.value.substring(0, 10);
      // make name input go away
      this.nameFormElement.setVisible(false);

      socket.emit('set player name', inputText.value);
    };
    this.nameFormElement.addListener('click');
    this.nameFormElement.on('click', function (this: any, event: any) {
      if (event.target.name !== 'playButton') return;
      nameSend();
    });

    this.input.keyboard?.on('keyup', (event: any) => {
      if (!this.nameFormElement) return;
      var inputText = this.nameFormElement.getChildByName('nameField') as HTMLInputElement;
      // only if key not enter
      if (event.keyCode !== 13) {
        this.setStyleForNameInputNotSent();
      }
      // if larger than 10 characters, remove last character
      if (inputText.value.length >= 10) {
        inputText.value = inputText.value.substring(0, 10);
      }
    });

    this.returnKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.returnKey?.on('down', function (this: any) {
      nameSend();
    });
    (() => {
      const roomData = persistentData.roomData;
      this.setUserNames(roomData);
    })();
    socket.on('room data', (roomData: RoomData) => {
      this.setUserNames(roomData);
    });
  }

  handleNameStyleChange() {
    if (!this.nameFormElement) return;
    var inputText = this.nameFormElement.getChildByName('nameField') as HTMLInputElement;
    if (!inputText) return;
    if (this.checkIfNameInInputIsSameAsCurrentName()) {
      // show a different style to the input box
      inputText.style.color = 'green';
      inputText.style.fontWeight = 'bold';
      // remove text background
      inputText.style.background = 'none';
    } else {
      this.setStyleForNameInputNotSent();
    }
  }

  setStyleForNameInputNotSent() {
    if (!this.nameFormElement) return;
    var inputText = this.nameFormElement.getChildByName('nameField') as HTMLInputElement;
    this.nameFormElement.setVisible(true);
    if (!inputText) return;
    inputText.style.color = 'black';
    inputText.style.fontWeight = 'normal';
    inputText.style.background = 'white';
  }

  checkIfNameInInputIsSameAsCurrentName() {
    if (!this.nameFormElement) return;
    var inputText = this.nameFormElement.getChildByName('nameField') as HTMLInputElement;
    if (!inputText) return;
    if (!persistentData.roomData) return;
    const myUser = findMyUser(persistentData.roomData);
    if (!myUser) return;
    if (inputText.value === myUser.name) return true;
    return false;
  }

  setUserNames(roomData: RoomData | null) {
    if (!roomData) return;
    const myUser = findMyUser(roomData);
    if (!myUser) return;
    const generatedName = myUser.name;
    if (!generatedName) return;
    if (!this.userAvatarContainer) return;
    this.userAvatarContainer.setUserName(generatedName);
  }

  update(time: number, delta: number) {
    this.playerMenu?.update(time, delta);
  }
}
