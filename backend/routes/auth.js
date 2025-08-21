    import express from "express";
    import bcrypt from "bcrypt";
    import jwt from "jsonwebtoken";
    import { supabase } from "../src/config/supabase.js";
    import dotenv from "dotenv";

    dotenv.config();
    const router = express.Router();

    // Helper: Generate JWT
    const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
    );
    };
    // Signup
    router.post("/signup", async (req, res) => {
    const { email, password , name, image_url} = req.body;

    try {
        const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
        if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert user
        const { data, error } = await supabase
        .from("users")
        .insert([{ name, email, password: hashedPassword, image_url }])
        .select()
        .single();

        if (error) throw error;

        const token = generateToken(data);
        res.json({ success: true, token, user: { id: data.id, email: data.email, name: data.name } });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });
    //  Login
    router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

        if (error || !user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Compare password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(user);
        res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    //  Logout (Client just removes token)
    router.post("/logout", (req, res) => {
    try {
        // If using cookies to store JWT, clear cookie
        res.clearCookie("token");

        return res.json({
        success: true,
        message: "Logout successful. Token cleared on client."
        });
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: "Logout failed",
        error: error.message
        });
    }
    });

    // Protected Route Example
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      console.log("No auth header received");
      return res.status(403).json({ success: false, message: "No token provided" });
    }

    console.log("Auth header:", authHeader);

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("No token after Bearer");
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decoded);
    } catch (err) {
      console.log("JWT verify error:", err.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const userId = typeof decoded.id === "string" ? decoded.id : parseInt(decoded.id);

const { data: user, error } = await supabase
  .from("users")
  .select("id, email, name")
  .eq("id", userId)
  .single();


    console.log("User fetched from Supabase:", user, "Error:", error);

    if (error || !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



    export default router;