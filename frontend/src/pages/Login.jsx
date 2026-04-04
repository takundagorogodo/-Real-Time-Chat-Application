import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    email: "", 
    password: "" 
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting login with:", loginData);
      const res = await axios.post("http://localhost:5000/api/auth/login", loginData);
      console.log("Login response:", res.data);
      
      if (res.data.user && res.data.accessToken) {
        login(res.data.user, res.data.accessToken);
        navigate("/chat");
      } else {
        alert("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting registration with:", registerData);
      const res = await axios.post("http://localhost:5000/api/auth/register", registerData);
      console.log("Register response:", res.data);
      
      if (res.data.user && res.data.accessToken) {
        login(res.data.user, res.data.accessToken);
        navigate("/chat");
      } else {
        alert("Invalid response from server");
      }
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container">
      <div className="left-side">
        <h1>Access your Account</h1>
        <p>Sign in or Sign up to use the app</p>
        <h3><b>chat with friends</b></h3>
      </div>

      <div className="right-side">
        <div className="button-box">
          <div 
            className="btn" 
            style={{ left: isLogin ? "2%" : "52%" }}
          ></div>
          <button
            type="button"
            className={`btn-toggle ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn-toggle ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
        <form
          id="login"
          onSubmit={handleLogin}
          style={{ left: isLogin ? "5%" : "-200%" }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          <span>Forgot password</span>
          <button type="submit" className="btn1">Login</button>
        </form>

        {/* REGISTER FORM */}
        <form
          id="register"
          onSubmit={handleRegister}
          style={{ left: isLogin ? "105%" : "5%" }}
        >
          <input
            type="text"
            placeholder="Username"
            required
            value={registerData.username}
            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="email@example.com"
            required
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          />
          <p>
            <input type="checkbox" className="checkbox" required />
            Agree to terms
          </p>
          <button type="submit" className="btn1">Register</button>
        </form>
      </div>
    </div>
    
  );
};

export default Login;