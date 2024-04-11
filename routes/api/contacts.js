const express = require("express");
const router = express.Router();
const contacts = require("../../models/contacts");

// List contacts
router.get("/", contacts.listContacts);

// Get contact by id
router.get("/:id", contacts.getContactById);

// Add contact
router.post("/", contacts.addContact);

// Delete contact
router.delete("/:id", contacts.removeContact);

// Update contact
router.put("/:id", contacts.updateContact);

router.patch("/:id/favorite", contacts.updateStatusContact);

module.exports = router;
