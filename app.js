//librerias
const firebase = require("firebase-admin");
const serviceAccount = require("./server/keys/firebase-key.json");//carga local key firebase
const express = require("express");
const { google } = require("googleapis");

//inicializadores
var accessToken = null;
const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/firebase.database"
];
const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    scopes
);
const app = express();
app.use(express.json())
const PORT = process.env.PORT || 3000;
jwtClient.authorize(function (error, tokens) {
    if (error) {
        console.error("Error generando token de acceso: ", error);
    } else if (tokens.access_token === null) {
        console.error("La cuenta de servicio (key) no tiene permisos para generar token.");
    } else {
        console.log("Token generado exitosamente!")
        accessToken = tokens.access_token;
        //inicia server
        app.listen(PORT, () => {
            console.log('Servidor escuchando en puerto ' + PORT + '!');
        });
    }
});
firebase.initializeApp({
    //credential: firebase.credential.applicationDefault(),
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://base-usuarios-admin.firebaseio.com"
});
const db = firebase.database();
const refDatosJuego = db.ref("datos-juego");
const usuariosRef = refDatosJuego.child("usuarios");

//server
app.post("/datos-juego/usuario", (req, res) => {
    console.log("POST /datos-juego/usuario");
    console.log(req.body);
    let ref = usuariosRef.child(req.body.username);
    ref.set({
        nombre: req.body.nombre,
        nivel: req.body.nivel
    }, (err) => {
        if (err) {
            //console.error("Ups! Error: " + JSON.stringify(err));
            res.send({
                respuesta: "ERROR",
                error: JSON.stringify(err)
            });
        } else {
            console.log("Todo OK!")
            res.send({
                respuesta: "OK"
            });
        }
    });
});