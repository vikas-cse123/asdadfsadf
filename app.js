import express from "express";
import Data from "./data.js"
import { connectDb } from "./db.js";
import {writeFile} from "fs/promises"
import { mkdir } from "fs/promises";
await mkdir("./logs", { recursive: true });
const app = express();
const PORT = 4000;

await connectDb();
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `${new Date().toLocaleString()} ${req.method} ${req.originalUrl}`,
  );
writeFile(`./logs/${Date.now()}-${crypto.randomUUID()}.json`, JSON.stringify(req.body, null, 2)).catch(
  (err) => console.log("log write failed", err)
);
  next();
});


function deepFind(obj, targetKey) {
  if (!obj || typeof obj !== "object") return undefined;

  if (Object.prototype.hasOwnProperty.call(obj, targetKey) && obj[targetKey]) {
    return obj[targetKey];
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object") {
      const found = deepFind(val, targetKey);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

app.post("/whatsapp/webhook", async (req, res) => {
  res.status(200).json({ message: "received" });

  try {
    const ctwaClid = deepFind(req.body, "ctwa_clid");
    if (!ctwaClid) return;

    const existing = await Data.findOne({ ctwaClid });
    if (existing) {
      console.log("clid already stored, skipping", ctwaClid);
      return;
    }

    const customerPhoneNumber = deepFind(req.body, "from");
    const businessPhoneNumber = deepFind(req.body, "display_phone_number");
    const businessPhoneNumberId = deepFind(req.body, "phone_number_id");
    const customerName = deepFind(req.body, "name");

    const savedData = await Data.create({
      ctwaClid,
      customerPhoneNumber,
      businessPhoneNumber,
      businessPhoneNumberId,
      name: customerName,
    });

    console.log("saved new clid", savedData._id);
  } catch (error) {
    if (error.code === 11000) {
      console.log("duplicate clid race, ignored");
    } else {
      console.log("webhook processing error", error);
    }
  }
});






app.listen(PORT, () => {
  console.log("Server started");
});
