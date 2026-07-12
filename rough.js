import crypto from "crypto"
const META_DATASET_ID=4415667522009072
const META_GRAPH_VERSION = "v25.0";
const META_WABA_ID=1249458963823794
const META_ACCESS_TOKEN="EAAXAUTcboo8BRZC4ZCqPK9ZBoAvFWGyEjZCqk4VFKlGXZCKSfKMvyBEAHJT1FZC3HPi5MSzDoR2DIe0BFcmLzijELB8JITKZBIOdcP98g78TmRN9LYYTepmxp8jwQUZAlPrIxxshCcxaxJHHOAlNmbtoDScT9H355Ih2rDZBCZBPD6ZCyjehLCSTMuDpruv1hzxAqOhkgZDZD"
function normalizePhone(phone) {
  let p = String(phone || "").replace(/\D/g, "");

  // India fallback: 9876543210 => 919876543210
  if (p.length === 10) {
    p = `91${p}`;
  }

  return p;
}

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
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

  // Optional: only send event_id if you pass it.
  // Meta dedups on (event_name + event_id); the Mongo doc _id is unique per
  // lead, so this makes the send idempotent. Cast to string for a clean payload.
  if (eventId) {
    event.event_id = String(eventId);
  }

  const payload = {
    data: [event],
  };


  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_DATASET_ID}/events?access_token=${META_ACCESS_TOKEN}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${META_ACCESS_TOKEN}`
    },
    body: JSON.stringify(payload),
  });
  console.log("Response meta");
  console.log(response);

  const result = await response.json();


  console.log("Meta result:");
  console.log(JSON.stringify(result, null, 2));

  if (!response.ok || result.error) {
    throw new Error(`Meta CAPI error: ${JSON.stringify(result)}`);
  }

  return {...result,status:response.status};
}



