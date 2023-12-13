

class ProductCreationError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class AddProductToCart extends Error{
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}


module.exports = {
    ProductCreationError,
    AddProductToCart

};