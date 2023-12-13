const dotenv = require('dotenv');

dotenv.config();
module.exports = {
    persistence: process.env.PERSISTENCE
};