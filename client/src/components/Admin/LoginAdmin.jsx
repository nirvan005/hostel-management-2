import React, { use, useRef, useState } from "react";
import LoginPage, {
  Username,
  Password,
  TitleSignup,
  TitleLogin,
  Submit,
  Title,
  Logo,
  Block,
  Render,
} from "@react-login-page/page8";
import LoginLogo from "react-login-page/logo";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router";
import axios from "axios";

const styles = { height: 690 };
const LoginAdmin = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const userRef = useRef();
  const passRef = useRef();
  const emailRef = useRef();
  const nameRef = useRef();
  const phoneRef = useRef();
  const adminKeyRef = useRef();
  const confirmPasswordRef = useRef();
  const passwordRef = useRef();
  const usernameRef = useRef();
  const [invalid, setInvalid] = useState(false);
  const handleSignup = async (event) => {
    event.preventDefault();
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    const email = emailRef.current.value;
    const name = nameRef.current.value;
    const phone = phoneRef.current.value;
    const adminKey = adminKeyRef.current.value;
    let checkEmail = false;
    let checkPassword = false;
    const userData = {
      username,
      password,
      email,
      name,
      phone,
    };
    const isValidEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    };
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    } else {
      checkEmail = true;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    } else {
      checkPassword = true;
    }
    if (checkEmail && checkPassword) {
      const api = axios.create({
        baseURL: "http://localhost:4000",
      });
      const response = await api.post("/signup-admin", {
        username,
        password,
        email,
        name,
        phone,
        adminKey,
      });
      if (response.status === 201) {
        console.log("Signup successful for admin:", username, password);
        navigate("/login-admin");
      }
    }
  };
  const handleLogin = async (event) => {
    event.preventDefault();

    const username = userRef.current.value;
    const password = passRef.current.value;
    const api = axios.create({
      baseURL: "http://localhost:4000",
    });
    try {
      const response = await api.post("/login-admin", {
        username,
        password,
      });
      const user_id = response.data.userId;
      if (response.status === 200) {
        auth.login({ username, role: "admin", user_id });
        console.log("Login successful for admin:", username);
        navigate("/home-admin");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setInvalid(true);
        setTimeout(() => {
          setInvalid(false);
        }, 5000);
      }
      // console.error("Login failed:", error);
    }
  };
  return (
    <div style={styles}>
      <LoginPage>
        <Title />
        <TitleSignup>Register</TitleSignup>
        <TitleLogin>Login</TitleLogin>
        <Logo>
          <LoginLogo />
        </Logo>
        <Username
          label="username"
          placeholder="Username"
          name="userUserName"
          ref={userRef}
        />
        <Password
          label="password"
          placeholder="Password"
          name="userPassword"
          ref={passRef}
        />
        {invalid && (
          <div style={{ color: "red" }}>
            Invalid username or password. Please try again.
          </div>
        )}
        <Submit keyname="submit" panel="login" onClick={handleLogin}>
          Login
        </Submit>

        <Username
          panel="signup"
          label="Name"
          placeholder="Name"
          keyname="name"
          type="text"
          ref={nameRef}
        />
        <Username
          panel="signup"
          label="Contact No."
          placeholder="Mobile No."
          keyname="phone"
          type="text"
          ref={phoneRef}
        />
        <Username
          panel="signup"
          label="E-Mail"
          placeholder="E-Mail"
          keyname="e-mail"
          type="email"
          ref={emailRef}
        />
        <Username
          panel="signup"
          label="Username"
          placeholder="Username"
          keyname="username"
          type="text"
          ref={usernameRef}
        />
        <Password
          panel="signup"
          label="Password"
          placeholder="Password"
          keyname="password"
          ref={passwordRef}
        />
        <Password
          panel="signup"
          label="Confirm Password"
          placeholder="Confirm Password"
          keyname="confirm-password"
          ref={confirmPasswordRef}
        />
        <Password
          panel="signup"
          label="Admin Key"
          placeholder="Admin Key"
          keyname="admin-key"
          ref={adminKeyRef}
        />
        <Submit keyname="signup-submit" panel="signup" onClick={handleSignup}>
          Register
        </Submit>
      </LoginPage>
    </div>
  );
};

export default LoginAdmin;
