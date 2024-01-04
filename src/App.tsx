import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppContextProvider } from "./client/AppContext";
import HomePage from "./client/Components/Pages/HomePage";
import HomePageCreatingRoomId from "./client/Components/Pages/HomePageCreatingRoomId";
import HostPage from "./client/PhaserPages/HostPage";
import PlayerPage from "./client/PhaserPages/PlayerPage";
import PlayerPageCreatingUserId from "./client/PhaserPages/PlayerPageCreatingUserId";

export default function App() {
  return (
    <AppContextProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePageCreatingRoomId />} />
            <Route path="/room/:roomId" element={<HomePage />} />

            <Route path="/host/:roomId/:game" element={<HostPage />} />

            <Route
              path="/room/:roomId/player"
              element={<PlayerPageCreatingUserId />}
            />
            <Route
              path="/room/:roomId/player/:userId"
              element={<PlayerPage />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </AppContextProvider>
  );
}
