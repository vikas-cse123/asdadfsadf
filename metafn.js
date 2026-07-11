import "dotenv/config";
import crypto from "node:crypto";

const META_GRAPH_VERSION = "v25.0";
const META_DATASET_ID = process.env.META_DATASET_ID;
const META_WABA_ID = process.env.META_WABA_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

function normalizePhone(phone) {
  let p = String(phone || "").replace(/\D/g, "");

  // India fallback: 9876543210 => 919876543210
  if (p.length === 10) {
    p = `91${p}`;
  }

  return p;
}

export async function sendLeadEventToMeta({
  phone,
  ctwa_clid,
  eventName = "LeadSubmitted",
  eventId,
  value = 1,
  leadStage = "qualified_lead",
}) {
  if (!META_DATASET_ID) {
    throw new Error("META_DATASET_ID missing in .env");
  }

  if (!META_WABA_ID) {
    throw new Error("META_WABA_ID missing in .env");
  }

  if (!META_ACCESS_TOKEN) {
    throw new Error("META_ACCESS_TOKEN missing in .env");
  }

  if (!phone) {
    throw new Error("phone missing");
  }

  if (!ctwa_clid) {
    throw new Error("ctwa_clid missing");
  }

  const normalizedPhone = normalizePhone(phone);

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),

    action_source: "business_messaging",
    messaging_channel: "whatsapp",

    user_data: {
      whatsapp_business_account_id: META_WABA_ID,

      // raw, do not hash
      ctwa_clid,

      // hashed phone
      ph: sha256(normalizedPhone),
    },

    custom_data: {
      currency: "INR",
      value,
      lead_stage: leadStage,
    },
  };

  // Optional: only send event_id if you pass it
  if (eventId) {
    event.event_id = eventId;
  }

  const payload = {
    data: [event],
  };

  console.log("Meta payload:");
  console.log(JSON.stringify(payload, null, 2));
  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_DATASET_ID}/events?access_token=${META_ACCESS_TOKEN}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${META_ACCESS_TOKEN}`
    },
    body: JSON.stringify(payload),
  });
  console.log(response);

  const result = await response.json();
  console.log(result);

  console.log("Meta response:");
  console.log(JSON.stringify(result, null, 2));

  if (!response.ok || result.error) {
    throw new Error(`Meta CAPI error: ${JSON.stringify(result)}`);
  }

  return {...result,status:response.status};
}

