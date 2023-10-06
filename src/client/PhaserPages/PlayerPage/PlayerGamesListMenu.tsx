import { List, ListItem } from "@mui/material";
import { MainMenuGameData } from "api/src/data/datas/MainMenuData";
import { gamesList } from "api/src/gamesList";
import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Textfit } from "../../Textfit";
import { palletColors } from "../../Palettes";
import socket from "../../SocketConnection";

export default function PlayerGamesListMenu() {
  const { roomId, userId } = useParams();

  // visible state bool
  const [visible, setVisible] = useState(false);

  const [timeOutVisible, setTimeOutVisible] = useState(false);

  // selected game state that is nullable string
  const [selectedGameNameName, setSelectedGame] = useState<string>("Random");

  // set visible to true after 1 second
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeOutVisible(true);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // add event listener to detect if the window should be visible
  useEffect(() => {
    const showGamesListMenu = (e: any) => {
      setVisible(e.detail.show);
      // scroll to selected game
    };
    window.addEventListener("showGamesListMenu", showGamesListMenu);
    return () => {
      window.removeEventListener("showGamesListMenu", showGamesListMenu);
    };
  }, []);

  useLayoutEffect(() => {
    // emit resizeSpecialEvent
    window.dispatchEvent(new Event("resizeSpecial"));
  }, [visible]);

  if (!visible || !timeOutVisible) {
    return null;
  }

  const selectedGame = gamesList.find(
    (game) => game.name === selectedGameNameName
  );
  return (
    <div
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(0%, 0%)",
        aspectRatio: 9 / 16,
        maxWidth: "100vw",
        maxHeight: "100vh",
        margin: "auto",
        backgroundColor: palletColors.color5,
        borderRadius: "20px",
        zIndex: 100,
      }}
    >
      {/* Show the current game being selected */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "20%",
        }}
      >
        {/* Add back button */}
        <button
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("showGamesListMenu", { detail: { show: false } })
            );
            const gameData: Partial<MainMenuGameData> = {};
            gameData.mainMenuPosition = 0;
            socket.emit("gameDataToHost", gameData);
          }}
          style={{
            border: "none",
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "15%",
            height: "20%",
            backgroundColor: palletColors.color3,
            color: palletColors.color1,
            borderRadius: "20px",
            // show pointer when hovering
            cursor: "pointer",
          }}
        >
          <Textfit
            style={{
              fontWeight: "bold",
              height: "80%",
              width: "100%",
              textAlign: "center",
            }}
          >
            Back
          </Textfit>
        </button>
        {selectedGame ? (
          <div>
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "19%",
                width: "70%",
                height: "20%",
                color: palletColors.color1,
              }}
            >
              <Textfit
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                {selectedGame.displayName}
              </Textfit>
            </div>
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "12%",
                width: "80%",
                height: "60%",
                color: palletColors.color1,
              }}
            >
              <Textfit
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                {selectedGame.description}
              </Textfit>
            </div>
            <button
              onClick={() => {
                const gameData: Partial<MainMenuGameData> = {};
                gameData.gameChosen = selectedGameNameName;
                socket.emit("gameDataToHost", gameData);
              }}
              style={{
                border: "none",
                position: "absolute",
                top: "80%",
                left: "50%",
                width: "48%",
                height: "20%",
                backgroundColor: palletColors.color2,
                padding: ".1%",
                borderRadius: "10px",
                color: palletColors.color4,
                fontWeight: "bold",
                // show pointer when hovering
                cursor: "pointer",
              }}
            >
              <Textfit
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                Play
              </Textfit>
            </button>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "30%",
              width: "80%",
              height: "50%",
              color: palletColors.color1,
            }}
          >
            <Textfit>Choose a game</Textfit>
          </div>
        )}
      </div>

      {/* Show the games that can be selected */}

      <List
        style={{
          position: "absolute",
          top: "20%",
          width: "100%",
          height: "80%",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          overflow: "auto",
          justifyContent: "around",
          backgroundColor: palletColors.color4,
          borderRadius: "10px",
        }}
      >
        {gamesList.map((game) => {
          if (game.name === selectedGameNameName) {
            return (
              <ListItem
                onClick={(e: any) => {
                  e.preventDefault();
                  setSelectedGame(game.name);
                  const gameData: Partial<MainMenuGameData> = {};
                  gameData.gameSelectingName = game.name;
                  socket.emit("gameDataToHost", gameData);
                }}
                key={game.name}
                style={{
                  width: "23%",
                  height: "15%",
                  borderRadius: "10px",
                  margin: "1%",
                  // show clickable
                  cursor: "pointer",
                  backgroundColor: palletColors.color3,
                }}
              >
                <Textfit
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    // make text not selectable
                    userSelect: "none",
                    backgroundColor: palletColors.color3,
                  }}
                >
                  {game.displayName}
                </Textfit>
              </ListItem>
            );
          }
          return (
            <ListItem
              onClick={(e: any) => {
                e.preventDefault();
                setSelectedGame(game.name);
                const gameData: Partial<MainMenuGameData> = {};
                gameData.gameSelectingName = game.name;
                socket.emit("gameDataToHost", gameData);
              }}
              key={game.name}
              style={{
                width: "23%",
                height: "15%",
                backgroundColor: palletColors.color1,
                borderRadius: "10px",
                margin: "1%",
                // show clickable
                cursor: "pointer",
              }}
            >
              <Textfit
                style={{
                  width: "100%",
                  height: "100%",
                  textAlign: "center",
                  backgroundColor: palletColors.color1,
                  // make text not selectable
                  userSelect: "none",
                }}
              >
                {game.displayName}
              </Textfit>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
