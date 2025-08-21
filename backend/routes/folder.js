import express from "express";
import { supabase } from "../src/config/supabase.js";
import { verifyToken } from "../middleware/authmiddle.js";

const router = express.Router();

/**
 * Root Folder
 */
router.get("/root", verifyToken, async (req, res) => {
  try {
    // Get the root folder for the user
    let { data: folder, error } = await supabase
      .from("folders")
      .select("id")
      .eq("user_id", req.user.id)
      .is("parent_id", null)
      .maybeSingle(); // returns null if none exists

    // If root folder does not exist, create it
    if (!folder) {
      const { data: newFolder, error: insertError } = await supabase
        .from("folders")
        .insert([{ name: "Root", user_id: req.user.id, parent_id: null }])
        .select("id")
        .single();

      if (insertError) throw insertError;
      folder = newFolder;
    }

    res.json({ success: true, folderId: folder.id });
  } catch (err) {
    console.error("Get root folder error:", err.message || err);
    res.status(400).json({ success: false, error: err.message || "Failed" });
  }
});

/**
 * Create Folder
 */
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const { data: inserted, error } = await supabase
      .from("folders")
      .insert([{
        name,
        parent_id: parentId || null,
        user_id: req.user.id,
        is_deleted: false
      }])
      .select("*")
      .single();

    if (error) throw error;

    res.json({ success: true, folder: inserted });
  } catch (err) {
    console.error("Create folder error:", err.message || err);
    res.status(400).json({ success: false, error: err.message || "Folder creation failed" });
  }
});

/**
 * List Files + Subfolders in Folder
 */
router.get("/:id/files", verifyToken, async (req, res) => {
  try {
    let { id } = req.params;

    if (!id || id === "null" || id === "undefined" || id === "root") {
      const { data: rootFolder, error: rootError } = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", req.user.id)
        .is("parent_id", null)
        .maybeSingle();

      if (rootError) throw rootError;
      if (!rootFolder) return res.json({ success: true, files: [], folders: [] });
      id = rootFolder.id;
    }

    const { data: files, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("folder_id", id)
      .eq("user_id", req.user.id)
      .eq("is_deleted", false);

    if (fileError) throw fileError;

    const { data: folders, error: folderError } = await supabase
      .from("folders")
      .select("*")
      .eq("parent_id", id)
      .eq("user_id", req.user.id)
      .eq("is_deleted", false);

    if (folderError) throw folderError;

    res.json({ success: true, files, folders });
  } catch (err) {
    console.error("Fetch folder contents error:", err.message || err);
    res.status(400).json({ success: false, error: err.message || "Fetch failed" });
  }
});

export default router;
