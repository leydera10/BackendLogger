class ProductDTO {
    constructor(product) {
      this.title = product.title || '';
      this.description = product.description || '';
      this.code = product.code || '';
      this.price = product.price || 0;
      this.stock = product.stock || 0;
      this.category = product.category || '';
      this.thumbnails = product.thumbnails || '';
      this.quantity = product.quantity || 1;
    }
  }
  
  module.exports = ProductDTO;