/*
 * File: login.js
 * Author: Athan Walker
 * Purpose: Provide a login page for students and coordinators.
 */
import React, { useContext, useEffect, useState } from "react";
import "./login.css";
import { useHistory } from "react-router";
import { login, user } from "../http";
import { AuthContext } from "../contexts/AuthContext";
import { isLoggedIn, loggedInRole } from "../utils";

function Login(props) {
  const { setAuth } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    const input = {};
    input[name] = value;
    setForm({ ...form, ...input });
  };

  /*
   * Allows the page path to be modified.
   */
  const history = useHistory();

  /*
   * Modify the page path to the registration page.
   */
  function handleSignup(e) {
    history.push("/signup");
  }

  /*
   * Modify the page path to the meetings page.
   */
  async function handleLogin(e) {
    //history.push("/allStudents");
    e.preventDefault();
    const { email, password } = form;
    try {
      await login({ username: email, password });
      setAuth({ userLoggedIn: isLoggedIn(), role: loggedInRole() });
      history.push("/meetings");
    } catch (error) {
      console.log(error.response);
    }
  }

  // useEffect(() => {
  //     const getUser = async () => {
  //         const u = await user();
  //         console.log(u);
  //     };
  //     getUser();
  // }, []);

  /*
   * Return a form for inputting email and a password.
   */
  return (
    <form id="loginForm" onSubmit={handleLogin}>
      <h1>Login</h1>
      <label>
        Email:
        <input
          type="text"
          name="email"
          onChange={handleOnChange}
          value={form["email"]}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          name="password"
          onChange={handleOnChange}
          value={form["password"]}
        />
      </label>
      <div>
        <p id="signUp" onClick={handleSignup}>
          Signup
        </p>
      </div>
      <input id="login" type="submit" value="Login" />
    </form>
  );
}

export default Login;
