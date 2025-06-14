require('dotenv').config();
const UPSTACK_TOKEN = process.env.UPSTACK_TOKEN

setInterval(async () => {
  try {
    const response = await fetch('https://dashing-hen-49086.upstash.io/rpop/contractDetails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer '+UPSTACK_TOKEN
      }
    });

    const json = await response.json();
    if (json?.result) {
      const data = JSON.parse(json.result);
      console.log("Worker got data:", data);

      await fetch('https://shivamforge-backend.onrender.com/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      await fetch('https://shivamforge-backend.onrender.com/send-email' , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {
            recipient : data.email,
          }
        ) 
      })

      // Optional: trigger email API
    }
  } catch (err) {
    console.error("Worker error:", err);
  }
}, 3000);
