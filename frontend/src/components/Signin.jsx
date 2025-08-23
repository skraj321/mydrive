import { useState } from "react";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.token);
      toast.success("Login successful!");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed or invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer autoClose={3000} />
      <form onSubmit={handleSignin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition"
        >
          Sign In
        </button>
        <p className="mt-4 text-center text-red-500">{message}</p>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} className="text-blue-500 underline">
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}
