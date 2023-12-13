class CartDTO {
    constructor(cart) {
        this.user = cart.user || null; // Puedes ajustar cómo manejas esto según tu lógica de negocio
        this.products = cart.products || [];
        this.total = cart.total || 0;
    }
}
  
module.exports = CartDTO;