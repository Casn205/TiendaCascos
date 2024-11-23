import { useState } from "react";
import Swal from "sweetalert2";

// Define the backend URL as a constant
const BACKEND_URL = "http://localhost:4000";

const Login = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to validate form inputs
  const validateFormData = () => {
    const { username, email, password } = formData;

    // Validate username: 1 <= length <= 40
    if (state === "Sign Up") {
      if (!username || username.length < 1 || username.length > 40) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Username',
          text: 'Username must be between 1 and 40 characters.',
        });
        return false;
      }
    }

    // Validate email format using regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return false;
    }

    // Validate password: 5 <= length <= 10
    if (!password || password.length < 5 || password.length > 10) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be between 5 and 10 characters.',
      });
      return false;
    }

    return true;
  };

  const login = async () => {
    console.log("Login function executed", formData);
    if (!validateFormData()) return;

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You have logged in successfully!',
        }).then(() => {
          window.location.replace("/");
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: responseData.errors,
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      Swal.fire({
        icon: 'error',
        title: 'Login Error',
        text: 'An error occurred while logging in. Please try again later.',
      });
    }
  };

  const signup = async () => {
    console.log("Signup function executed", formData);
    if (!validateFormData()) return;

    try {
      const response = await fetch(`${BACKEND_URL}/signup`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        Swal.fire({
          icon: 'success',
          title: 'Signup Successful',
          text: 'Account created successfully!',
        }).then(() => {
          window.location.replace("/");
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: responseData.errors,
        });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      Swal.fire({
        icon: 'error',
        title: 'Signup Error',
        text: 'An error occurred while signing up. Please try again later.',
      });
    }
  };

  return (
    <section className="max_padd_container flexCenter flex-col pt-32">
      <div className="max-w-[555px] h-[600px] bg-white m-auto px-14 py-10 rounded-md">
        <h3 className="h3">{state}</h3>
        <div className="flex flex-col gap-4 mt-7">
          {state === "Sign Up" && (
            <input
              name="username"
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder="Your Name"
              maxLength="40" // Limit username to 40 characters
              className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
            />
          )}
          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder="Email Address"
            maxLength="50" // Optional limit for email length
            className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
          />
          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder="Password"
            maxLength="10" // Limit password to 10 characters
            className="h-14 w-full pl-5 bg-slate-900/5 outline-none rounded-xl"
          />
        </div>
        <button
          onClick={() => { state === "Login" ? login() : signup(); }}
          className="btn_dark_rounded my-5 w-full !rounded-md"
        >
          Continue
        </button>
        {state === "Sign Up" ? (
          <p className="text-black font-bold">
            Already have an account?{" "}
            <span onClick={() => setState("Login")} className="text-secondary underline cursor-pointer">
              Login
            </span>
          </p>
        ) : (
          <p className="text-black font-bold">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")} className="text-secondary underline cursor-pointer">
              Click here
            </span>
          </p>
        )}
        <div className="flexCenter mt-6 gap-3">
          <input type="checkbox" name="" id="" />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </section>
  );
};

export default Login;
