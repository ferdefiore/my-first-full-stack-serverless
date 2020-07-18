//manejador autenticacion
const jwt = require('jsonwebtoken')
const Users = require('../models/Users')


const isAuthenticated = (req, res, next) => { //esto es un midleware recibe req,res,next
    const token = req.headers.authorization
    if (!token){ //verificamos existencia del token
        return res.sendStatus(403)
    }
    jwt.verify(token,'mi-secreto', (err,decoded) => { //si existia, verificamos el token
        const { _id } = decoded
        Users.findOne({ _id }).exec()
        .then(user => { //cuando conseguimos el usuario, modificamos el req que queda disponible para el siguiente midleware y llamando a next llamamos al proximo midleware
            req.user = user
            next()
        })
    })
}

const hasRoles = roles => (req, res, next) => {
    if (roles.indexOf(req.user.role) > -1) {
        return next()
    }
    res.sendStatus(403)
}

module.exports = {
    isAuthenticated,
    hasRoles,
}