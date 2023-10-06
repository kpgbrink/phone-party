import { Game } from "api";
import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../AppContext";
import HostBeforeTableGameScene from "./HostScenes/HostBeforeTableGameScene";
import HostBeginScene from "./HostScenes/HostBeginScene";
import OmahaHostScene from "./HostScenes/OmahaHostScene";
import TexasHostScene from "./HostScenes/TexasHostScene";
import ThirtyOneHostScene from "./HostScenes/ThirtyOneHostScene";
import PhaserWrapper from "./PhaserWrapper";

export default function HostPage() {
  const { socket } = useContext(AppContext);
  const { roomId, game } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("host room", roomId);
    // Get Game Data for the game
    if (!game) {
      throw new Error("game is not defined in the URL");
    }
    const updateGame: Partial<Game> = {
      // Spread gameData into updateGame
      selectedGameName: game,
    };
    socket.emit("update game", updateGame);
    // add listener to allow phaser code to change url
    window.addEventListener(
      "changeroute",
      (e: any) => {
        const { detail: path } = e;
        navigate(path);
      },
      true
    );
    return () => {
      // remove event listener
      window.removeEventListener("changeroute", () => {});
    };
  }, [game, roomId, socket, navigate]);

  return (
    <div id="fullScreen">
      <PhaserWrapper
        config={{
          scene: [
            HostBeginScene,
            HostBeforeTableGameScene,
            OmahaHostScene,
            TexasHostScene,
            ThirtyOneHostScene,
          ],
          scale: {
            width: 1920 * 2,
            height: 1080 * 2,
          },
        }}
      />
    </div>
  );
}
