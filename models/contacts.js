const Contact = require("../mongodb/contactsSchema");
const { contactSchema } = require("../validation/joi");

// wcześniejsza funkcja
// const listContacts = async (req, res, next) => {
//   try {
//     const contacts = await Contact.find({ owner: req.user._id });
//     res.status(200).json(contacts);
//   } catch (error) {
//     next(error);
//   }
// };

const getContactsList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, favorite } = req.query;
    const query = { owner: req.user._id };

    if (favorite !== undefined) {
      query.favorite = favorite;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const contacts = await Contact.paginate(query, options);

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

    if (contact.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (deletedContact.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  const { name, email, phone } = req.body;
  const { error } = contactSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const existingContact = await Contact.findOne({
      owner: req.user._id,
      $or: [{ phone }, { email }],
    });
    if (existingContact) {
      return res.status(400).json({
        message: "Contact with the same email or phone number already exists",
      });
    }
    const newContact = {
      name,
      email,
      phone,
      owner: req.user._id,
    };
    await Contact.create(newContact);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  const contactId = req.params.id;
  const { error } = contactSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const contact = await Contact.findOne({
      _id: contactId,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const { name, email, phone } = req.body;

    if (name !== undefined) {
      contact.name = name;
    }
    if (email !== undefined) {
      contact.email = email;
    }
    if (phone !== undefined) {
      contact.phone = phone;
    }

    await contact.save();

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const contactId = req.params.id;
    const contact = await Contact.findOne({
      _id: contactId,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.favorite = !contact.favorite;
    await contact.save();

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContactsList,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
