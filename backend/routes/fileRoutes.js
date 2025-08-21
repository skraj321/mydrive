import express from "express";
import { supabase } from "../src/config/supabase.js";
import { verifyToken } from "../middleware/authmiddle.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Get Files in Folder
 */
router.get("/file/:folderId/getfiles", verifyToken, async (req, res) => {
  try {
    let { folderId } = req.params;

    // Handle "root" folder
    if (
      !folderId ||
      folderId === "null" ||
      folderId === "undefined" ||
      folderId === "root"
    ) {
      const { data: rootFolder, error: rootError } = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", req.user.id)
        .is("parent_id", null)
        .maybeSingle();

      if (rootError) throw rootError;
      if (!rootFolder) return res.json({ success: true, files: [] });
      folderId = rootFolder.id;
    }

    // Fetch files
    const { data: files, error } = await supabase
      .from("files")
      .select("*")
      .eq("folder_id", folderId)
      .eq("user_id", req.user.id)
      .eq("is_deleted", false);

    if (error) throw error;
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data, error } = await supabase.storage
          .from("drive")
          .createSignedUrl(file.storage_key, 60); // URL valid for 60s
        if (error) return { ...file, url: null };
        return { ...file, url: data.signedUrl };
      })
    );

    res.json({ success: true, files: filesWithUrls });
  } catch (err) {
    console.error("Get files error:", err.message || err);
    res
      .status(400)
      .json({ success: false, error: err.message || "Failed to fetch files" });
  }
});

/**
 * Upload File
 */
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    let { folderId } = req.body;

    if (!req.user?.id)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    // Handle root folder
    if (
      !folderId ||
      folderId === "null" ||
      folderId === "undefined" ||
      folderId === "root"
    ) {
      const { data: rootFolder, error: rootError } = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", req.user.id)
        .is("parent_id", null)
        .maybeSingle();

      if (rootError) throw rootError;

      if (!rootFolder) {
        const { data: newRoot, error: insertError } = await supabase
          .from("folders")
          .insert([{ name: "Root", user_id: req.user.id, parent_id: null }])
          .select("id")
          .single();

        if (insertError) throw insertError;
        folderId = newRoot.id;
      } else {
        folderId = rootFolder.id;
      }
    }

    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });

    const storageKey = `${req.user.id}/${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("drive")
      .upload(storageKey, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: inserted, error: dbError } = await supabase
      .from("files")
      .insert([
        {
          name: file.originalname,
          mime_type: file.mimetype,
          size_bytes: file.size,
          storage_key: storageKey,
          user_id: req.user.id,
          folder_id: folderId,
          is_deleted: false,
        },
      ])
      .select("*")
      .single();

    if (dbError) throw dbError;

    res.json({ success: true, file: inserted });
  } catch (err) {
    console.error("Upload error:", err.message || err);
    res
      .status(400)
      .json({ success: false, error: err.message || "Upload failed" });
  }
});

/**
 * Rename File
 */
router.patch("/file/:id/rename", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    const { data, error } = await supabase
      .from("files")
      .update({ name: newName })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("*")
      .single();

    if (error) throw error;

    res.json({ success: true, file: data });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, error: err.message || "Rename failed" });
  }
});

/**
 * Delete File (soft delete)
 */
router.delete("/file/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("files")
      .update({ is_deleted: true })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("*")
      .single();

    if (error) throw error;

    res.json({ success: true, file: data, message: "File moved to trash" });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, error: err.message || "Delete failed" });
  }
});

export default router;
