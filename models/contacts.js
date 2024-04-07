const fs = require("fs/promises");

const readFile = async () => {
  try {
    const data = await fs.readFile("./models/contacts.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading contacts file:", error.message);
    return [];
  }
};

const listContacts = async () => {
  return await readFile();
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  return contacts.find((contact) => contact.id === contactId);
};

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const indexToRemove = contacts.findIndex(
      (contact) => contact.id === contactId
    );

    if (indexToRemove === -1) {
      return null;
    }

    const deletedContact = contacts.splice(indexToRemove, 1)[0];

    await fs.writeFile(
      "./models/contacts.json",
      JSON.stringify(contacts, null, 2),
      "utf-8"
    );

    return deletedContact;
  } catch (error) {
    console.error("Error writing contacts file:", error.message);
    return null;
  }
};

const addContact = async (body) => {
  try {
    const contacts = await listContacts();
    const newContact = { ...body };
    contacts.push(newContact);

    await fs.writeFile(
      "./models/contacts.json",
      JSON.stringify(contacts, null, 2),
      "utf-8"
    );

    return newContact;
  } catch (error) {
    console.error("Error adding new contact:", error.message);
    return null;
  }
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const updatedContacts = contacts.map((contact) =>
    contact.id === contactId ? { ...contact, ...body } : contact
  );
  await fs.writeFile(
    "./models/contacts.json",
    JSON.stringify(updatedContacts, null, 2),
    "utf-8"
  );
  return updatedContacts.find((contact) => contact.id === contactId);
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
