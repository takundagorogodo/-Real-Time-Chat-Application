import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:5000", {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on("connect_error", (err) => {
      console.log("Socket connection error:", err.message);
      if (err.message === "Invalid or expired token") {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        window.location.href = "/";
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};