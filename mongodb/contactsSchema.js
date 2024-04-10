const mongoose = require("mongoose");
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

contactSchema.statics.listContacts = function () {
  return Contact.find();
};

contactSchema.statics.getContactById = function (contactId) {
  return Contact.findById(contactId);
};

contactSchema.statics.removeContact = function (contactId) {
  return Contact.findByIdAndDelete(contactId);
};

contactSchema.statics.addContact = function (body) {
  const newContact = new Contact(body);
  return newContact.save();
};

contactSchema.statics.updateContact = function (contactId, body) {
  return Contact.findByIdAndUpdate(contactId, body, { new: true });
};

const Contact = mongoose.model("Contact", contactSchema, "db-contacts");

module.exports = Contact;
