import sanitizeHtml from "sanitize-html";
import dotenv from "dotenv";
dotenv.config();

import { getDatabase } from "./mongo.js";

const MONGO_COLLECTION_LIGHT_DATA = process.env.MONGO_COLLECTION_LIGHT_DATA;
const MONGO_COLLECTION_POST_HTML = process.env.MONGO_COLLECTION_POST_HTML;

async function list(_req, res) {
  try {
    const database = await getDatabase();
    const collection = database.collection(MONGO_COLLECTION_LIGHT_DATA);
    const data = await collection.find().toArray();

    res.json(data).status(200);
  } catch (error) {
    console.error("Error listing data", error);
    res.status(500).json({ error: "Internal server error :<" });
  }
}

async function getHtml(req, res) {
  try {
    const { post_id } = req.body;
    if (!post_id) {
      return res.status(400).json({ error: "post_id is required" });
    }

    const database = await getDatabase();
    const collection = database.collection(MONGO_COLLECTION_POST_HTML);
    const data = await collection.findOne({ post_id });

    if (!data) {
      return res.status(404).json({ error: "Post not found" });
    }

    const cleanedContentHTML = sanitizeHtml(data.contentHTML, {
      allowedTags: ["p", "i", "a"],
    });

    delete data.contentHTML;
    data.cleanedContentHtml = cleanedContentHTML;

    res.send({ data });
  } catch (e) {
    console.error("Error fetching post HTML: ", e);
    res.status(500).json({ error: "Error fetching post HTML: " + e.message });
  }
}

/* ended up not using this */
/* from UW CSE-331 */
function isRecord(val) {
  return val !== null && typeof val === "object";
}

/* ended up not using this */
function first(param) {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === "string") {
    return param;
  } else {
    return undefined;
  }
}

export { list, getHtml };
