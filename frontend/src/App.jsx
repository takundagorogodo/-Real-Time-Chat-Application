import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { GroupProvider } from "./context/GroupContext";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/chat" /> : <Login />}
      />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/chat"
        element={user ? <Chat /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <GroupProvider>
            <AppRoutes />
          </GroupProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;