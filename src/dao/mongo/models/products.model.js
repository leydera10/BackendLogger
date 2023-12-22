const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")

const productsCollection = "products";

const productSchema = new mongoose.Schema({
    title: {type: String, max: 100, required: true},
    description: {type: String, max: 100, required: true},
    code: {type: String, max: 100, required: true},
    price: {type: Number, required: true},
    stock: {type: Number, required: true},
    category: {type: String, max: 100, required: true},
    thumbnails: {type: String, max: 100, required: true},
    owner: {type: String, max: 100,},
    quantity: { type: Number, default: 1 }
});


productSchema.pre("save", function(next) {
    if (!this.owner) {
        // Accede al usuario autenticado desde req.user o this._user
        const user = this._user || {};
        console.log("Contenido de this._user:", user);
        // Verifica el rol del usuario
        if (user && user.rol === "premium") {
            this.owner = user.email; // Establece el email del usuario premium como propietario
        } else {
            this.owner = "admin"; // Establece por defecto como "admin" si no es premium
        }
    }
    next();
});


/* productSchema.pre("save", async function(next) {
    try {
      if (!this.owner) {
        if (this.isNew && req.user) {
          const user = req.user;
    
          // verifica rol del usuario
          if (user.role === "premium") {
            this.owner = user.email; // establece el propietario como el correo del usuario premium
          } else {
            this.owner = "admin"; // establece por defecto como "admin" si no es premium
          }
        } else {
          this.owner = "admin"; // si no hay usuario autenticado, establece por defecto como "admin"
        }
      }
      next();
    } catch (error) {
      next(error);
    }
}); */

productSchema.plugin(mongoosePaginate);
const productModel = mongoose.model(productsCollection, productSchema)

module.exports = {productModel}
