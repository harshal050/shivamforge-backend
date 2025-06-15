// index.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
// const client   = require('./queue')
const MONGODB_URI = process.env.MONGODB_URI;
const cors = require('cors')
const bodyParser = require('body-parser')
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const  {HfInference} = require("@huggingface/inference");
const HF_TOKEN = process.env.HF_TOKEN;
const EMAIL =  process.env.EMAIL
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY =  process.env.CLOUD_API_KEY
const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET
const HF_MODEL = process.env.HF_MODEL
const UPSTACK_TOKEN = process.env.UPSTACK_TOKEN


// console.log("CLOUD_API_SECRET "+HF_TOKEN)



const emailHtmlContent = `<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Shivam Forge!</title>
    <style type="text/css">
        /* Basic Reset & Body Styles */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: #e0e7ed; /* Very light blue-gray background */
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            width: 100% !important;
        }

        /* Ensure tables are not collapsed */
        table {
            border-spacing: 0;
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        /* Cells inherit font styles */
        td {
            padding: 0;
            font-family: 'Inter', sans-serif;
        }

        /* Image Reset */
        img {
            border: 0;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }

        /* Main Container */
        .email-container {
            max-width: 768px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            overflow: hidden; /* To ensure rounded corners clip content */
        }

        /* Header Section */
        .header {
            background-color: #1A2B4C; /* Fallback for gradient - dark muted blue */
            background-image: linear-gradient(to right, #1A2B4C, #0F1D36, #051022); /* Dark blue gradient */
            color: #ffffff;
            padding: 24px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            text-align: center;
        }
        .header-logo {
            width: 120px; /* Increased size for a bigger logo */
            height: 120px; /* Increased size for a bigger logo */
            border-radius: 50%; /* Ensures a perfectly round shape */
            border: 4px solid #1A2B4C; /* Dark blue border, matching a shade in the gradient */
            display: block; /* To center in some clients */
            margin: 0 auto 10px auto; /* Adjust spacing */
            object-fit: cover; /* Ensures the image covers the area without distortion */
            background-color: #ffffff; /* Fallback background for transparent logos */
        }
        .header-title {
            font-size: 30px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-top: 0;
            margin-bottom: 5px;
        }
        .header-subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 0;
            margin-bottom: 0;
        }

        /* Main Content Section */
        .content-section {
            padding: 24px;
            color: #1f2937; /* text-gray-800 */
        }
        .content-title {
            font-size: 24px;
            font-weight: bold;
            color: #0F1D36; /* Darker blue for headings */
            margin-top: 0;
            margin-bottom: 16px;
        }
        .content-paragraph {
            font-size: 16px;
            line-height: 1.6;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .content-highlight {
            font-size: 18px;
            font-weight: 600;
            color: #1A2B4C; /* Dark muted blue for highlights */
            margin-top: 0;
            margin-bottom: 24px;
        }

        /* Company Details Section */
        .details-section {
            background-color: #f9fafb; /* bg-gray-50 - light gray */
            padding: 24px;
            border-top: 1px solid #e5e7eb; /* border-t border-gray-200 */
            color: #4b5563; /* text-gray-700 */
        }
        .details-heading {
            font-size: 20px;
            font-weight: bold;
            color: #4b5563; /* Keep grey for contrast with dark blue elements */
            margin-top: 0;
            margin-bottom: 16px;
        }
        .details-item {
            margin-bottom: 16px; /* gap-y-4 */
        }
        .details-item-title {
            font-weight: 600;
            color: #1A2B4C; /* Dark muted blue for titles */
            margin-bottom: 4px; /* mb-1 */
        }
        .details-item-content {
            font-size: 14px;
            line-height: 1.5;
        }
        .details-item-content a {
            color: #1A2B4C; /* Dark muted blue for links */
            text-decoration: none;
        }
        .details-item-content a:hover {
            text-decoration: underline;
        }

        /* Footer Section */
        .footer {
            background-color: #051022; /* Very dark blue for the footer */
            padding: 16px;
            color: #ffffff;
            text-align: center;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
        }
        .footer-text {
            font-size: 14px;
            margin-top: 0;
            margin-bottom: 8px;
        }
        .footer-small-text {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 0;
            margin-bottom: 0;
        }

        /* Responsive Styles (Media Queries) */
        @media only screen and (min-width: 600px) {
            .email-container {
                padding: 32px; /* md:p-8 */
            }
            .header {
                padding: 32px; /* md:p-8 */
            }
            .header-title {
                font-size: 36px; /* md:text-4xl */
            }
            .header-subtitle {
                font-size: 16px; /* md:text-base */
            }
            .content-section {
                padding: 32px; /* md:p-8 */
            }
            .content-title {
                font-size: 30px; /* md:text-3xl */
            }
            .content-paragraph {
                font-size: 18px; /* md:text-lg */
            }
            .details-section {
                padding: 32px; /* md:p-8 */
            }
            .details-heading {
                font-size: 24px; /* md:text-2xl */
            }
            .footer {
                padding: 24px; /* md:p-6 */
            }
            .footer-text {
                font-size: 16px; /* md:text-base */
            }
            .footer-small-text {
                font-size: 14px; /* md:text-sm */
            }

            /* For company details 2-column layout on desktop */
            .details-grid {
                display: table; /* Use table for column layout */
                width: 100%;
                table-layout: fixed;
            }
            .details-grid-column {
                display: table-cell;
                width: 50%;
                padding-right: 24px; /* gap-x-6 */
                vertical-align: top;
            }
            .details-grid-column:last-child {
                padding-right: 0;
            }
             .details-item {
                margin-bottom: 0; /* Remove gap-y on desktop when using columns */
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header Section -->
        <table role="presentation" width="100%" class="header">
            <tr>
                <td>
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding-bottom: 10px;">
                                <!-- Logo image with specified URL, size, round shape, and dark blue border -->
                                <img src="https://res.cloudinary.com/dcuhpeczg/image/upload/v1749619186/products/oqynug8dvg6ydb1vxcbx.png" alt="Shivam Forge Logo" class="header-logo">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 class="header-title">SHIVAM FORGE</h1>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p class="header-subtitle">Forging Excellence, Delivering Quality</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Main Content Section -->
        <table role="presentation" width="100%" class="content-section">
            <tr>
                <td>
                    <h2 class="content-title">Thank You for Connecting With Us!</h2>
                    <p class="content-paragraph">Dear Valued Client,</p>
                    <p class="content-paragraph">We've successfully received your inquiry and sincerely appreciate you reaching out to Shivam Forge. Your interest means a lot to us, and we are thrilled to assist you.</p>
                    <p class="content-paragraph">Our team is already reviewing your message and will get back to you with a comprehensive response very soon. We pride ourselves on prompt and effective communication, ensuring your needs are met with the utmost attention.</p>
                    <p class="content-paragraph">In the meantime, feel free to explore more about our services and capabilities on our website, or refer to the contact details below for any urgent queries.</p>
                    <p class="content-highlight">We look forward to serving you!</p>
                </td>
            </tr>
        </table>

        <!-- Company Details Section -->
        <table role="presentation" width="100%" class="details-section">
            <tr>
                <td>
                    <h3 class="details-heading">Our Details:</h3>
                    <table role="presentation" width="100%" class="details-grid">
                        <tr>
                            <td class="details-grid-column">
                                <div class="details-item">
                                    <p class="details-item-title">Address:</p>
                                    <p class="details-item-content">Shivam Forge<br>Bhaktanya Industrial Area,<br>Shapar (Veraval), Rajkot 360024</p>
                                </div>
                                <div class="details-item">
                                    <p class="details-item-title">Email:</p>
                                    <p class="details-item-content"><a href="mailto:Salesshivamforge@gmail.com">Salesshivamforge@gmail.com</a></p>
                                </div>
                            </td>
                            <td class="details-grid-column">
                                <div class="details-item">
                                    <p class="details-item-title">Contact Numbers:</p>
                                    <p class="details-item-content">Yash Patel: <a href="tel:+919265772827">+91 9265772827</a><br>Hetvik Patel: <a href="tel:+916352877378">+91 6352877378</a><br>Parth Patel: <a href="tel:+917600066117">+91 7600066117</a></p>
                                </div>
                                <div class="details-item">
                                    <p class="details-item-title">Business Hours:</p>
                                    <p class="details-item-content">Monday - Friday: 9:00 AM - 6:00 PM<br>Saturday: 10:00 AM - 2:00 PM<br>Sunday: Closed</p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Footer Section -->
        <table role="presentation" width="100%" class="footer">
            <tr>
                <td>
                    <p class="footer-text">&copy; 2025 Shivam Forge. All rights reserved.</p>
                    <p class="footer-small-text">This is an automated email, please do not reply to this address.</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`


// app.use(express.json()); // required to parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // parses application/x-www-form-urlencoded


// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '10mb' })); // allows base64 image & JSON
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cors({
  origin: ['https://www.shivamforge.com', 'https://shivamforge.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));





cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // e.g., 'smtp.gmail.com' for Gmail
    port: 587, // or 465 for SSL
    secure: false, // true for 465, false for other ports

  auth: {
    user: EMAIL,
    pass: SMTP_PASSWORD
  }
});

app.post('/send-email', (req, res) => {
  const mailOptions = {
    from: EMAIL,
    to: req.body.recipient,
    subject: 'Thank You for Contacting Shivam Forge!',
    html: emailHtmlContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent successfully');
    }
  });
});


app.post('/push-queue', async (req,res)=>{
  // const det = req.body.toString()
  // console.log("dett "+det)

  const payload = req.body
  // console.log("req.body.data "+payload.name)

  // console.log("redisClient "+client)

    try{
        // console.log("send msg to queue")
        // await pushToRedis(data)

        // const connRedis = await redisClient.connect()
        // console.log("connRedis "+connRedis)
        // console.log("queue msg "+data)
        // await redisClient.lPush("contractDetails" , data)

        // const payload = {
        //   name:"harshalbhai",
        //   email: "harshalupwork07@gmail.com",
        //   phone : "9537325355",
        //   message: "okkkkkkkkkkkkkkkkkkk"   
        // }


        
        const redisPush = await fetch(`https://dashing-hen-49086.upstash.io/lpush/contractDetails/${encodeURIComponent(JSON.stringify(payload))}`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer '+UPSTACK_TOKEN
          }
        });
        const data = await redisPush.json() 
        console.log("redisPush result"+data)
        
        
        res.json({data , success:"True"})
        // res.json({redisClient , success:"True"})
    }catch(e){
        res.json({msg:"err to send msg" , success:"False"})
    }

})


app.post('/pop-queue', async (req,res)=>{
  try{
    const response = await fetch('https://dashing-hen-49086.upstash.io/rpop/contractDetails', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer '+UPSTACK_TOKEN
        }
    });
    const data = await response.json();
    res.json(data)
  }catch(e){
    res.json({msg:e})
  }
})



app.post('/hf-callapi' , async (req,res)=>{
    const hf = new HfInference(HF_TOKEN);
  const chatCompletion  = await hf.chatCompletion({
    model: HF_MODEL,
    messages: [
      {
        role: "user",
        content: `Give me a product description of the following item in approximately 40 words. The description should highlight its industrial application, durability, material, and functionality in a professional and technical tone: ${req.body.data}`
      }
    ]
  });
  // console.log()
  const result = chatCompletion.choices[0]?.message?.content || 'No response from model';

  res.json({msg:result})


})


if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  message: { type: String },
  status: { type: String, default: 'pending' }
}, {
  timestamps: true // this automatically adds and updates createdAt and updatedAt
});

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  image: String
}, {
  timestamps: true // this automatically adds and updates createdAt and updatedAt
});


const catagorySchema = new mongoose.Schema({
  name:String
})

const Contact = mongoose.model('Contact', contactSchema);
const Product = mongoose.model('Product', productSchema);
const Catagory = mongoose.model('Catagory', catagorySchema);


app.use(express.json());

app.post('/contacts', async (req, res) => {
  const { name, email, phone, message, status } = req.body;

  // console.log("nameeeeeeeee "+name)
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const newContact = await Contact.create({
      name,
      email,
      phone,
      message,
      status
    });
    res.status(201).json(newContact);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A contact with this email already exists.' });
    }
    res.status(500).json({ error: 'Failed to save contact.' });
  }
});

app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

app.get('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch contact.' });
  }
});


app.delete('/contacts', async (req, res) => {
  try {
    await Contact.deleteMany();
    res.status(200).json({msg:"delete Successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete contacts.' });
  }
});


app.put('/contacts/:id', async (req, res) => {
  const id  = req.params.id
  const status = req.body.status
  console.log("ok idddddddddddd "+id)
  // console.log("debgug id: "+id)
  try {
    await Contact.findByIdAndUpdate(id,{status});
    res.status(200).json({msg:"update Successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update products.' });
  }
});


app.post('/products', async (req, res) => {
  const { name, category, description, image } = req.body;

  if (!name || !category || !image) {
    return res.status(400).json({ error: 'Name and category and image are required.' });
  }

  try {
    const newProduct = await Product.create({
      name,
      category,
      description,
      image
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A Product with this email already exists.' });
    }
    res.status(500).json({ error: 'Failed to save Product.' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

app.get('/products/:id', async (req, res) => {
  const id  = req.params.id
  try {
    const products = await Product.findById(id);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

app.put('/products/:id', async (req, res) => {
  const id  = req.params.id
  console.log("id of backend "+id)
  // console.log("okkk "+req.body.payload.name)
  const data = req.body?.payload
  console.log("data "+data)
  try {
    const products = await Product.findByIdAndUpdate(id,data);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

app.delete('/products', async (req, res) => {
  try {
    const products = await Product.deleteMany();
    res.status(200).json({msg:"delete Successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete products.' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const id  = req.params.id
  console.log("ok idddddddddddd "+id)
  // console.log("debgug id: "+id)
  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({msg:"delete Successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete products.' });
  }
});


app.post('/products/upload', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64 || !imageBase64.startsWith('data:image')) {
      return res.status(400).json({ message: 'Invalid or missing image data.' });
    }

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'products',
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      ok: 1,
      url: result.secure_url,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});


app.post('/category', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'category name is required.' });
  }

  try {
    const newProduct = await Catagory.create({
      name
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save category.' });
  }
});



app.get('/category', async (req, res) => {

  try {
    const newProduct = await Catagory.find();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load category.' });
  }
});

app.delete('/category/:id', async (req, res) => {
  const id  = req.params.id
  console.log("ok idddddddddddd "+id)
  // console.log("debgug id: "+id)
  try {
    await Catagory.findByIdAndDelete(id);
    res.status(200).json({msg:"delete Successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('Mongoose disconnected on app termination');
  process.exit(0);
});
