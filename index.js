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
const SECRET_KEY_CLOUDFLARE = process.env.SECRET_KEY_CLOUDFLARE

// console.log("CLOUD_API_SECRET "+HF_TOKEN)


const {htmlContentfile} = require('./email')


// app.use(express.json()); // required to parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // parses application/x-www-form-urlencoded


// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '10mb' })); // allows base64 image & JSON
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cors({
  origin: ['https://www.shivamforge.com' , 'https://shivamforge.com'], 
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
  console.log("send-email")
  const To = req.body.recipient
  const mailOptions = {
    from: EMAIL,
    to: To,
    subject: 'Thank You for Contacting Shivam Forge!',
    html: htmlContentfile
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
  const payload = req.body.data
  // const data = payload.data
  const token = req.body.token
  console.log("payload "+payload)
  // console.log("token "+token)

  const formdata = new FormData()
  formdata.append('secret' , SECRET_KEY_CLOUDFLARE)
  formdata.append('response' , token)


  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

  // console.log("redisClient "+client)

    // try{

      const response =await fetch(url , {
        method:"post",
        body:formdata
      })

      // console.log("response "+response)

      const result = await response.json()
      
      if(!result.success){
        console.log("Invalid reCAPTCHA token")
        // throw new Error("Invalid reCAPTCHA token")
        return res.status(403).json({ msg: "Invalid reCAPTCHA token",success:"False"});
      }
      
      console.log("result.success "+result.success)
      console.log("send msg to queue")

      // res.status(403).json({ msg: "okk"});

        const redisPush = await fetch(`https://dashing-hen-49086.upstash.io/lpush/contractDetails/${encodeURIComponent(JSON.stringify(payload))}`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer '+UPSTACK_TOKEN
          }
        });
        const data = await redisPush.json() 
        console.log("redisPush result"+data)

        if(data){
          res.json({msg:"succesfully send mail" , success:"True"})
        }
        else{
          res.json({msg:"faild to send mail" , success:"False"})
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
  email: { type: String, required: true},
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

const adminSchema = new mongoose.Schema({
  name:String,
  password:String
})


const catagorySchema = new mongoose.Schema({
  name:String
})

const Contact = mongoose.model('Contact', contactSchema);
const Product = mongoose.model('Product', productSchema);
const Catagory = mongoose.model('Catagory', catagorySchema);
const Admin = mongoose.model('Admin', adminSchema);


app.use(express.json());




app.get('/admin', async (req, res) => {
  try {
    const adminData = await Admin.findOne();
    res.status(200).json(adminData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

app.post('/admin', async (req, res) => {
  const { name, password } = req.body;

  // console.log("nameeeeeeeee "+name)
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const newAdmin = await Admin.create({
      name,
      password
    });
    res.status(201).json({msg:"Admin added Successfully" , success:"False"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to save contact.',success:"True" });
  }
});

app.put('/admin/:id', async (req, res) => {
  const id = req.params.id
  const {name, password } = req.body;

  // console.log("nameeeeeeeee "+name)
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const newAdmin = await Admin.findByIdAndUpdate(id,{
      name,
      password
    });
    res.status(201).json({msg:"Admin added Successfully" , success:"True"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to save contact.',success:"False" });
  }
});



app.post('/contacts', async (req, res) => {
  const { name, email, phone, message, status } = req.body;

  // console.log("nameeeeeeeee "+name)
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' ,success : "False"});
  }

  try {
    const newContact = await Contact.create({
      name,
      email,
      phone,
      message,
      status
    });
    res.status(201).json({success:"True"});
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A contact with this email already exists.',success : "False" });
    }
    res.status(500).json({ error: 'Failed to save contact.' ,success : "False" });
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

app.delete('/inquiries/:id' , async (req,res)=>{  
  const id = req.params.id
  const isIdExist = await Contact.findById(id)
  if(isIdExist){
    await Contact.findByIdAndDelete(id)
    res.status(200).json({msg:"delete Successfully" , success:"True"});
  }
  res.status(500).json({ msg: 'Failed to delete products.' ,success:"True"});
})





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
  const data = req.body
  console.log("data "+data.name)
  try {
    const product = await Product.findByIdAndUpdate(id,data);
    res.status(200).json(product);
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
