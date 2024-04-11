const Contact = require("../mongodb/contactsSchema");
const validation = require("../validation/joi");

const listContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json(contact);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Not found" });
    } else {
      res.json({ message: "contact deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addContact = async (req, res) => {
  const { name, email, phone } = req.body;
  const { error } = validation.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const contacts = await Contact.find();
    const existingContact = contacts.find(
      (contact) => contact.phone === phone || contact.email === email
    );
    if (existingContact) {
      return res.status(400).json({
        message: "Contact with the same email or phone number already exists",
      });
    }
    const newContact = {
      name,
      email,
      phone,
    };
    await Contact.create(newContact);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateContact = async (req, res) => {
  const contactId = req.params.id;
  const { error } = validation.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const existingContact = await Contact.findById(contactId);

    if (!existingContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await Contact.findByIdAndUpdate(contactId, req.body);

    res.status(200).json(existingContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatusContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    const favoriteValue = contact.favorite;

    contact.favorite = !favoriteValue;
    await contact.save();

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
