import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Mini Snake game component
function SnakeGame() {
  const gridSize = 10;
  const initialSnake = [
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ];
  const [snake, setSnake] = useState(initialSnake);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 7, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Move snake
  React.useEffect(() => {
    if (gameOver) return;
    const handle = setInterval(() => {
      setSnake((prev) => {
        const newHead = {
          x: prev[0].x + direction.x,
          y: prev[0].y + direction.y,
        };
        // Check collision
        if (
          newHead.x < 0 ||
          newHead.x >= gridSize ||
          newHead.y < 0 ||
          newHead.y >= gridSize ||
          prev.some((s) => s.x === newHead.x && s.y === newHead.y)
        ) {
          setGameOver(true);
          return prev;
        }
        let newSnake = [newHead, ...prev];
        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1);
          let newFood;
          do {
            newFood = {
              x: Math.floor(Math.random() * gridSize),
              y: Math.floor(Math.random() * gridSize),
            };
          } while (newSnake.some((s) => s.x === newFood.x && s.y === newFood.y));
          setFood(newFood);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 180);
    return () => clearInterval(handle);
  }, [direction, food, gameOver, gameKey]);

  // Keyboard controls
  React.useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowUp" && direction.y !== 1) setDirection({ x: 0, y: -1 });
      if (e.key === "ArrowDown" && direction.y !== -1) setDirection({ x: 0, y: 1 });
      if (e.key === "ArrowLeft" && direction.x !== 1) setDirection({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && direction.x !== -1) setDirection({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction, gameOver]);

  const handleRestart = () => {
    setSnake(initialSnake);
    setDirection({ x: 1, y: 0 });
    setFood({ x: 7, y: 5 });
    setScore(0);
    setGameOver(false);
    setGameKey((k) => k + 1);
  };

  return (
    <div className="relative w-64 h-64 bg-white/80 rounded-xl shadow-lg mb-6 flex flex-col items-center justify-center overflow-hidden border-2 border-green-200">
      <div className="absolute top-2 left-2 text-xs text-green-600 font-semibold">Snake Game</div>
      <div className="absolute top-2 right-2 text-xs text-gray-400">Score: {score}</div>
      <div className="grid grid-cols-10 grid-rows-10 gap-0.5 mt-6">
        {[...Array(gridSize * gridSize)].map((_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className={`w-5 h-5 rounded ${
                isHead
                  ? "bg-green-600"
                  : isSnake
                  ? "bg-green-300"
                  : isFood
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-white/0"
              }`}
            />
          );
        })}
      </div>
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
          <div className="text-lg font-bold text-green-700 mb-2">Game Over!</div>
          <button
            onClick={handleRestart}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    const selectedRole = window.prompt("Sign up as 'patient' or 'doctor'? Type your choice:", "patient");
    if (!selectedRole || (selectedRole !== "patient" && selectedRole !== "doctor")) {
      alert("Please enter 'patient' or 'doctor' for role.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        role: selectedRole
      });
      navigate(selectedRole === "doctor" ? "/doctordashboard" : "/patientdashboard");
    } catch (error) {
      alert("Google sign up failed: " + error.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(res.user, { displayName: form.name });
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        name: form.name,
        email: form.email,
        role
      });
      navigate(role === "doctor" ? "/doctordashboard" : "/patientdashboard");
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-pink-100 px-4 py-10 overflow-hidden">
      {/* Blurred floating shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-300 opacity-30 rounded-full filter blur-3xl animate-float z-0" style={{animationDuration:'7s'}} />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-300 opacity-20 rounded-full filter blur-2xl animate-float z-0" style={{animationDuration:'9s'}} />
      <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-yellow-200 opacity-20 rounded-full filter blur-2xl animate-float z-0" style={{animationDuration:'11s'}} />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-green-200 opacity-20 rounded-full filter blur-2xl animate-float z-0" style={{animationDuration:'13s'}} />
      {/* Animated health icons */}
      <div className="absolute top-16 left-24 z-0 animate-bounce-slow">
        {/* Heart icon */}
        <svg className="w-12 h-12 text-red-400 opacity-60" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="absolute bottom-24 right-32 z-0 animate-pulse-slow">
        {/* Medical cross icon */}
        <svg className="w-10 h-10 text-blue-400 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="absolute top-1/3 right-1/4 z-0 animate-float">
        {/* Stethoscope icon */}
        <svg className="w-12 h-12 text-green-400 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v6a6 6 0 006 6 6 6 0 006-6V3m-6 18v-2m0 0a4 4 0 004-4h-4a4 4 0 01-4 4z" />
        </svg>
      </div>
      <div className="relative w-full max-w-3xl flex flex-col md:flex-row items-center justify-center z-10 gap-8">
        {/* Mini-game column */}
        <div className="mb-8 md:mb-0 md:mr-0 flex-shrink-0 flex flex-col items-center">
          <SnakeGame />
        </div>
        {/* Form container */}
        <div className="relative w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center">
            <img
              src="https://e7.pngegg.com/pngimages/261/718/png-clipart-perth-health-fitness-and-wellness-logo-meetup-embracing-miscellaneous-leaf-thumbnail.png"
              alt="Health Logo"
              className="w-16 h-16 mb-2 animate-float"
            />
            <h2 className="text-2xl font-bold text-indigo-700">Create Account</h2>
            <p className="text-gray-500 text-sm">Register for Swasthyakink</p>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold shadow hover:bg-yellow-50 hover:border-yellow-400 transition-colors duration-200 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.61l6.85-6.85C36.68 2.69 30.82 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C.7 16.09 0 19.95 0 24c0 4.05.7 7.91 2.69 11.9l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.9-5.82l-7.19-5.59c-2.01 1.35-4.59 2.16-8.71 2.16-6.38 0-11.87-3.59-14.33-8.94l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            Sign up with Google
          </button>
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M21.12 15.804A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-1.13 0-2.22.148-3.25.425M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.32 4.906A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-2.042 0-3.97.488-5.627 1.354M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M3.98 8.223l16.34 9.557" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M21.12 15.804A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-1.13 0-2.22.148-3.25.425M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.32 4.906A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-2.042 0-3.97.488-5.627 1.354M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M3.98 8.223l16.34 9.557" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Register as</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-yellow-400 hover:text-indigo-800 transition-colors duration-200 mt-2"
            >
              Register
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-yellow-500 font-semibold">Login</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register; 