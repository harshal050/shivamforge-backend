"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const client_1 = require("../generated/prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.post('/api/contacts', async (req, res) => {
    console.log("nameeeeeeee ");
    const { name, email, phone, message, status } = req.body;
    const data = {
        name,
        email,
        phone,
        message,
        status,
    };
    const newContact = await prisma.contact.create({
        data
    });
    res.status(201).json(newContact);
    // if (!name || !email) {
    //   return res.status(400).json({ error: 'Name and email are required.' });
    // }
    // try {
    //   const newContact = await prisma.contact.create({
    //     data
    //   });
    //   res.status(201).json(newContact);
    // } catch (error: any) {
    //   console.error('Error saving contact:', error);
    //   if (error.code === 'P2002') {
    //     return res.status(409).json({ error: 'A contact with this email already exists.' });
    //   }
    //   res.status(500).json({ error: 'Failed to save contact.' });
    // }
});
app.get('/api/contacts', async (req, res) => {
    console.log("gettt ");
    try {
        const contacts = await prisma.contact.findMany();
        res.status(200).json(contacts);
    }
    catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts.' });
    }
});
app.get('/api/contacts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const contact = await prisma.contact.findUnique({
            where: {
                id: id,
            },
        });
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found.' });
        }
        res.status(200).json(contact);
    }
    catch (error) {
        console.error('Error fetching contact by ID:', error);
        res.status(500).json({ error: 'Failed to fetch contact.' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
