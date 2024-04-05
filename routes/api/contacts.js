const express = require("express");
const router = express.Router();
const contactsModel = require("../../models/contacts");
const validation = require("../../validation/joi");
const { v4: uuidv4 } = require("uuid");

function generateRandomId() {
  return uuidv4().replace(/-/g, "").substr(0, 21);
}

// List contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsModel.listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// Get contact by id
router.get("/:id", async (req, res, next) => {
  try {
    const contact = await contactsModel.getContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

// Update contact
router.put("/:id", async (req, res) => {
  const { name, email, phone } = req.body;
  const contactId = req.params.id;

  const updatedContact = { name, email, phone };

  const { error } = validation.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existingContact = await contactsModel.getContactById(contactId);

    if (!existingContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    Object.keys(updatedContact).forEach((key) => {
      if (!updatedContact[key]) {
        updatedContact[key] = existingContact[key];
      }
    });

    const result = await contactsModel.updateContact(contactId, updatedContact);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add contact
router.post("/", async (req, res) => {
  const { name, email, phone } = req.body;

  const { error } = validation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const contacts = await contactsModel.listContacts();
    const existingContact = contacts.find(
      (contact) => contact.name === name || contact.email === email
    );
    if (existingContact) {
      return res.status(400).json({
        message: "Contact with the same email or phone number already exists",
      });
    }

    const newContact = {
      id: generateRandomId(),
      name,
      email,
      phone,
    };

    await contactsModel.addContact(newContact);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete contact
router.delete("/:id", async (req, res) => {
  const deletedContact = await contactsModel.removeContact(req.params.id);
  if (!deletedContact) {
    return res.status(404).json({ message: "Not found" });
  }
  res.json({ message: "contact deleted" });
});

module.exports = router;
