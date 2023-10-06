import {
  MainMenuGameData,
  PlayerMainMenuData,
} from "api/src/data/datas/MainMenuData";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { palletColors } from "../../Palettes";
import { HostDataHandler } from "../../PhaserPages/HostScenes/hostObjects/HostDataHandler";
import HostPlayerChooseGame from "./HomePage/HostPlayerChooseGame";
import PlayerJoin from "./HomePage/HostPlayerJoin";

export default function HomePage() {
  const { roomId } = useParams();
  const { setRoomCreated, roomCreated, userList, socket } =
    useContext(AppContext);
  document.documentElement.style.cursor = "auto";
  const navigate = useNavigate();

  // add game data to state
  const [mainMenuData, setMainMenuData] = useState<MainMenuGameData>(
    new MainMenuGameData()
  );

  const hostMainMenuDataHandler = new HostMainMenuDataHandler(
    mainMenuData,
    setMainMenuData
  );

  // use menu data handler to handle the data
  useEffect(() => {
    hostMainMenuDataHandler.create();
    return () => {
      hostMainMenuDataHandler.destroy();
    };
  });

  // If Main menu position is 1 and there are no players, then switch back to 0
  useEffect(() => {
    if (mainMenuData.mainMenuPosition === 1 && userList.length === 0) {
      setMainMenuData({ ...mainMenuData, mainMenuPosition: 0 });
    }
  }, [mainMenuData, userList]);

  // if Main menu game chosen go to the game
  useEffect(() => {
    if (mainMenuData.gameChosen) {
      // setMainMenuData({ ...mainMenuData, gameChosen: false });
      // if game is chosen then go to the game
      const navigateTo = `/host/${roomCreated}/${mainMenuData.gameChosen}`;
      navigate(navigateTo);
    }
  }, [mainMenuData, navigate, roomCreated]);

  // check every 5 seconds if socket is connected if not then refresh the page
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log("socket connected", socket.connected);
  //     if (!socket.connected) {
  //       setTimeout(() => {
  //         console.log("refresh");
  //         window.location.reload();
  //       }, 500);
  //     }
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  // Start hosting room
  useEffect(() => {
    if (!roomId && !roomCreated) return;
    const hostRoomId = roomId || roomCreated;
    socket.emit("host room", hostRoomId);
    setRoomCreated(hostRoomId);
  }, [setRoomCreated, roomCreated, roomId, socket]);

  return (
    <div id="homePageContainer">
      <div
        id="homePage"
        style={{
          backgroundColor: palletColors.color5,
        }}
      >
        {mainMenuData.mainMenuPosition === 0 && <PlayerJoin />}
        {mainMenuData.mainMenuPosition === 1 && (
          <HostPlayerChooseGame mainMenuData={mainMenuData} />
        )}
      </div>
    </div>
  );
}

export class HostMainMenuDataHandler extends HostDataHandler<
  PlayerMainMenuData,
  MainMenuGameData
> {
  mainMenuGameData: MainMenuGameData;
  setMainMenuGameData: (gameData: MainMenuGameData) => void;
  interval: NodeJS.Timer | undefined;

  constructor(
    mainMenuGameData: MainMenuGameData,
    setGameData: (gameData: MainMenuGameData) => void
  ) {
    super();
    this.mainMenuGameData = mainMenuGameData;
    this.setMainMenuGameData = setGameData;
  }

  create() {
    super.create();
    this.sendGameData();
  }

  destroy() {
    super.destroy();
  }

  override getPlayerDataToSend(
    userId: string
  ): Partial<PlayerMainMenuData> | undefined {
    return undefined;
  }

  override onPlayerDataReceived(
    userId: string,
    playerData: Partial<PlayerMainMenuData>,
    gameData: Partial<MainMenuGameData> | null
  ): void {}

  override getGameDataToSend(): Partial<MainMenuGameData> | undefined {
    return this.mainMenuGameData;
  }

  override onGameDataReceived(
    userId: string,
    gameData: Partial<MainMenuGameData>,
    playerData: Partial<PlayerMainMenuData> | null,
    updateGameData: boolean
  ): void {
    this.mainMenuGameData = { ...this.mainMenuGameData, ...gameData };
    this.setMainMenuGameData(this.mainMenuGameData);

    this.sendGameData();
  }
}
