const express = require("express");
const router = express.Router();
const contacts = require("../../models/contacts");
const authCheck = require("../../middleware");

// List contacts
router.get("/", authCheck, contacts.getContactsList);

// Get contact by id
router.get("/:id", authCheck, contacts.getContactById);

// Add contact
router.post("/", authCheck, contacts.addContact);

// Delete contact
router.delete("/:id", authCheck, contacts.removeContact);

// Update contact
router.put("/:id", authCheck, contacts.updateContact);

// Update status contact
router.patch("/:id/favorite", authCheck, contacts.updateStatusContact);

module.exports = router;
