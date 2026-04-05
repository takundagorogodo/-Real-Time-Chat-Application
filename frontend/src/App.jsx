import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
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
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;