import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/download.jpeg";
import "./auth.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({
    rollNumber: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    rollNumber: "",
    name: "",
    password: ""
  });

  const rollNumberRegex = /^(2[0-9])B\d{2}(CS|IT|EC|ME|EE)\d{3}$/i;

  const getBranch = (roll) => {
    const match = roll.toUpperCase().match(rollNumberRegex);
    return match ? match[2] : "";
  };

    const getYear = (roll) => {
  const match = roll.toUpperCase().match(rollNumberRegex);
  if (!match) return "";

  const yearPrefix = parseInt(match[1]);
  const enrollmentYear = 2000 + yearPrefix;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // ❗ invalid if future year
  if (enrollmentYear > currentYear) {
    return "Invalid year";
  }

  // ❗ invalid if same year but before August
  if (enrollmentYear === currentYear && currentMonth < 8) {
    return "Invalid year";
  }

  let year;

  if (currentMonth >= 8) {
    year = currentYear - enrollmentYear + 1;
  } else {
    year = currentYear - enrollmentYear;
  }

  if (year < 1) year = 1;
  if (year > 4) year = 4;

  return year;
};

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        loginData
      );

      login(res.data.user, res.data.accessToken);
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!rollNumberRegex.test(registerData.rollNumber)) {
      alert("Invalid format. Example: 24B11CS488");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        registerData
      );

      login(res.data.user, res.data.accessToken);
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container">
      <div className="left-side">
        <div>
          <img src={logo} alt="Aditya University" />
        </div>
        <h1>Aditya Connect</h1>
        <p>Connect with fellow students</p>
        <h3><b>Real-time messaging</b></h3>
      </div>

      <div className={`right-side ${!isLogin ? "register-active" : ""}`}>

        {/* TOGGLE */}
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

        
        <div className="form-wrapper">

          
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Roll Number"
              required
              value={loginData.rollNumber}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  rollNumber: e.target.value.toUpperCase()
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value
                })
              }
            />

            <span>Forgot password?</span>

            <button className="btn1">Login</button>
          </form>

          
          <form onSubmit={handleRegister} className="reg">
            <input
              type="text"
              placeholder="Roll Number"
              required
              value={registerData.rollNumber}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  rollNumber: e.target.value.toUpperCase()
                })
              }
            />

            {registerData.rollNumber && (
              <div style={{ fontSize: "13px" }}>
                <p>Branch: {getBranch(registerData.rollNumber) || "Invalid"}</p>
                <p>Year: {getYear(registerData.rollNumber) || "Invalid"}</p>
              </div>
            )}

            <input
              type="text"
              placeholder="Full Name"
              required
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  name: e.target.value
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  password: e.target.value
                })
              }
            />

            <div className="checkbox-container">
              <input type="checkbox" required />
              <span>I agree to terms</span>
            </div>

            <button className="btn1">Register</button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;