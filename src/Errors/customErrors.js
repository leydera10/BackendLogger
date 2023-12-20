// customErrors.js
class CustomError extends Error {
    constructor(type, message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = type;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Función para lanzar errores personalizados
function throwError(type, message, statusCode) {
    throw new CustomError(type, message, statusCode);
}

// Middleware de manejo de errores
function errorMiddleware(err, req, res, next) {
    console.error(err.stack); // Loguea el error para referencia
    res.status(err.statusCode || 500).json({ error: err.message });
}

const Errors = {
    PRODUCT_CREATION: 'ProductCreationError',
    ADD_PRODUCT_TO_CART: 'AddProductToCart',
    // Agrega más tipos de errores según sea necesario
};

module.exports = {
    CustomError,
    throwError,
    errorMiddleware,
    Errors,
};
