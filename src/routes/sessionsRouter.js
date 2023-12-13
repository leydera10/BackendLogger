const express = require('express');
const passport = require('passport');
const { generateToken } = require("../utils.js");

const router = express.Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { });

router.get("/api/sessions/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
    if (req.isAuthenticated()) {
        const token = generateToken(req.user);
        console.log("Token generado:", token);
        req.session.user = req.user;
        // Establecer las variables de sesión según lo necesites
        req.session.nombreUsuario = req.user.nombre;
        /* req.session.apellidoUsuario = req.user.last_name; */
        req.session.email = req.user.email;
        res.redirect("/allproducts");
    } else {
        res.redirect("/login");
    }
});


module.exports = router;

