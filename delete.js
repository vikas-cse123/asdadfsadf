import { credentials } from "./credentials.js";

 const event = {
  account_id: '719eab51-8dd1-4e45-9096-1b875de1b8b3',
  flow_id: '5c63b007-7501-4768-a7f2-aad214d7b94d',
  node_id: 'send_message',
  node_type: 'send_message',
  customer: {
    phone_number: '918737064453',
    name: 'Interscale Marketing',
    id: '9f10c957-8a19-456a-b214-b5887a1c38dd'
  },
  business: {
    phone_number_id: '1180619111803795'
  },
  data: {},
  timestamp: '2026-07-13T11:05:51.008Z'
}

const customerPhone = event?.customer?.phone_number;
    const businessPhoneNumberId = event?.business?.phone_number_id

    console.log({customerPhone,businessPhoneNumberId});


const a = credentials[businessPhoneNumberId]
console.log(a);