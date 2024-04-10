const Contact = require("../mongodb/contactsSchema");

const listContacts = async () => {
  try {
    return await Contact.listContacts();
  } catch (error) {
    throw new Error("Error find contacts list");
  }
};

const getContactById = async (contactId) => {
  try {
    return Contact.getContactById();
  } catch (error) {
    throw new Error("Error find contact");
  }
};

const removeContact = async (contactId) => {
  try {
    return Contact.removeContact(contactId);
  } catch (error) {
    throw new Error("Error remov contact");
  }
};

const addContact = async (body) => {
  try {
    return Contact.addContact(body);
  } catch (error) {
    throw new Error("Error adding contact");
  }
};

const updateContact = async (contactId, body) => {
  try {
    return Contact.updateContact(contactId, body);
  } catch (error) {
    throw new Error("Error updating contact data");
  }
};

const updateStatusContact = async (contactId, body) => {
  try {
    return await Contact.updateContact(contactId, body);
  } catch (error) {
    throw new Error("Error updating contact status");
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
