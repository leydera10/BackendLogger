const { Contacts, Products, Carts, Users } = require("../dao/factory.js");

const ContactRepository = require("./contacts.repository.js");
const ProductRepository = require("./products.repository.js");
const CartRepository = require("./carts.repository.js");
const UserRepository = require("./users.repository.js");

const contactService = new ContactRepository(new Contacts());
const productService = new ProductRepository(new Products());
const cartService = new CartRepository(new Carts());
const userService = new UserRepository(new Users());

module.exports = {
  contactService,
  productService,
  cartService,
  userService,
};