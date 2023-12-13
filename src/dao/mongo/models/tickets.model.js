const mongoose = require("mongoose");

const ticketsCollection = "tickets";

const ticketSchema = new mongoose.Schema(
  {
    code: { type: String, max: 100, unique: true, required: true },
    purchaser: { type: String, max: 30, required: true },
    amount: { type: Number },
    purchase_datetime: { type: Date, default: Date.now },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }] // Campo para la fecha de compra
  },
  { timestamps: true } // Usar timestamps para createdAt y updatedAt mongoose manejara automaticamente la creacion y actualizacion del ticket
);

const ticketModel = mongoose.model(ticketsCollection, ticketSchema);

module.exports = { ticketModel };