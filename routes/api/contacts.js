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
  const contactId = req.params.id;
  const { error } = validation.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  } else {
    try {
      const existingContact = await contactsModel.getContactById(contactId);

      if (!existingContact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      const updatedContact = { ...existingContact, ...req.body };

      const result = await contactsModel.updateContact(
        contactId,
        updatedContact
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// Add contact
router.post("/", async (req, res) => {
  const { name, email, phone } = req.body;
  const { error } = validation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  } else {
    try {
      const contacts = await contactsModel.listContacts();
      const existingContact = contacts.find(
        (contact) => contact.phone === phone || contact.email === email
      );
      if (existingContact) {
        return res.status(400).json({
          message: "Contact with the same email or phone number already exists",
        });
      } else {
        const newContact = {
          id: generateRandomId(),
          name,
          email,
          phone,
        };
        await contactsModel.addContact(newContact);
        res.status(201).json(newContact);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// Delete contact
router.delete("/:id", async (req, res) => {
  try {
    const deletedContact = await contactsModel.removeContact(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Not found" });
    } else {
      res.json({ message: "contact deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/id/favorite", async (req, res) => {
  try {
    const contactId = req.params.contactId;

    if (!req.body.favorite) {
      return res.status(400).json({ message: "missing field favorite" });
    }

    const updatedContact = await contactsModel.updateStatusContact(
      contactId,
      req.body
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json(updatedContact);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
