const Contact = require("../mongodb/contactsSchema");
const validation = require("../validation/joi");
const { v4: uuidv4 } = require("uuid");

function generateRandomId() {
  return uuidv4().replace(/-/g, "").substr(0, 21);
}

const listContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Not found" });
    } else {
      res.json({ message: "contact deleted" });
    }
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  const { name, email, phone } = req.body;
  const { error } = validation.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  } else {
    try {
      const contacts = await Contact.find();
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
        await Contact.create(newContact);
        res.status(201).json(newContact);
      }
    } catch (error) {
      next(error);
    }
  }
};

const updateContact = async (req, res, next) => {
  const contactId = req.params.id;
  const { error } = validation.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  } else {
    try {
      const existingContact = await Contact.findById(contactId);

      if (!existingContact) {
        return res.status(404).json({ message: "Contact not found" });
      } else {
        const updatedContact = { ...existingContact, ...req.body };

        const result = await Contact.findByIdAndUpdate(
          contactId,
          updatedContact,
          { new: true }
        );

        res.status(200).json(result);
      }
    } catch (error) {
      next(error);
    }
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const contactId = req.params.id;

    if (!req.body.favorite) {
      return res.status(400).json({ message: "missing field favorite" });
    } else {
      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        req.body,
        { new: true }
      );

      if (!updatedContact) {
        return res.status(404).json({ message: "Not found" });
      } else {
        res.status(200).json(updatedContact);
      }
    }
  } catch (error) {
    next(error);
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
