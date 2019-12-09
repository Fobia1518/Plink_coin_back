/**
 * Constantes con las librerias utilizadas
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;
const { User, Coin } = require('./models');
const jwt = require('jsonwebtoken');
const config = require('./config/jwt');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            tittle: 'Plink API',
            description: 'Coin - User API',
            contact: { name: 'FullStack Developer'},
            servers: ['https://plink-coin-back.herokuapp.com/']
        }
    },
    apis: ['app.js']
}

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

/**
 * EndPoint API Test running
 * @swagger
 * /:
 *  get:
 *      tags: 
 *      - "API"
 *      summary: EndPoint inicial del API
 *      description: Main API
 *      responses:
 *          200:
 *              description: API success              
 *
 */
app.get('/', function(req, res){
    res.redirect('/api');
 });

/**
 * @swagger
 * /api:
 *  get:
 *      tags: 
 *      - "API"
 *      summary: API running
 *      description: API
 *      responses:
 *          200:
 *              description: API success              
 *
 */
app.get('/api',(req,res) => res.json({message: "API running"}));

/**
 * @swagger
 * /api/login:
 *  post:
 *      tags: 
 *      - "Login"
 *      summary: "Login User"
 *      description: ""
 *      operationId: "getUser"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      -   in: "body"
 *          name: "object"
 *          description: "Ingresar data del usuario a loguearse"
 *          required: true
 *          schema:
 *              type: "object"
 *              properties:
 *                  user:
 *                      type: "string"
 *                      description: "Nombre del usuario"
 *                  pass:
 *                      type: "string"
 *                      description: "Nombre del usuario"
 *      responses:
 *          200: 
 *              description: "Success Login"
 *              examples:
 *                  application/json: { "token": "eyJhbGciOiJIUzI1uiolyertf3456745hNhjliIsInRfahfjkgsdfsghd5cCI6IkdgjhrgysdfghpXVyBlmUpI"}
 *          403:
 *              description: "Forbidden" 
 */
app.post('/api/login', async (req, res) => { //Login
    let user = ''; 
    let pass = ''; 
    user = req.body.user; 
    pass = req.body.pass; "../definitions/User"
  
    let data = { 
        "username": user, 
        "contrasena":pass, 
    } 
    let validUser = await getUser(data, req, res);
    let token = jwt.sign(validUser, config.jwtKey, { expiresIn: '1h' }, (err, token) =>{
        if(err){
            return res.json({mensaje: err})
        }
        res.json({
            token: token
        })
    });
}) 

/**
 * @swagger
 * /api/users:
 *  get:
 *      tags: 
 *      - "User"
 *      summary: Get all users
 *      description: Get all users
 *      parameters:
 *      -   in: "header"
 *          name: "Authorization"
 *          description": "Token JWT"
 *      responses:
 *          200:
 *              description: API success
 *              examples: 
 *                  application/json: {"id":1,"nombre":"fabian","apellido":"ortiz","contrasena":"1234","username":"fabian","monedaPrefe":"COP","createdAt":"2019-11-29T11:46:00.000Z","updatedAt":"2019-11-29T11:46:02.000Z"}
 *          403:
 *              description: "Forbidden"            
 */
app.get('/api/users', (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    jwt.verify(token, config.jwtKey, (err, decoded) => {
        if(err){
            res.sendStatus(403)
        }
        else{
            User.findAll().then(users => res.json(users))
        }
    })
})

/**
 * @swagger
 * /api/coins:
 *  get:
 *      tags: 
 *      - "Coin"
 *      summary: Get coin's users
 *      description: Get all users
 *      parameters:
 *      -   in: "header"
 *          name: "Authorization"
 *          description": "Token JWT"
 *      responses:
 *          200:
 *              description: API success
 *              examples: 
 *                  application/json: {"id":5,"iduser":7,"coin":"LTC","createdAt":"2019-12-01T22:20:28.000Z","updatedAt":"2019-12-01T22:20:28.000Z"}
 *          403:
 *              description: "Forbidden"            
 */
app.get('/api/coins', (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    jwt.verify(token, config.jwtKey, (err, decoded) => {
        if(err){
            res.sendStatus(403)
        }
        else{
            Coin.findAll().then(coins => res.json(coins))
        }
    })
})

/**
 * @swagger
* {
*  "/api/create/user": {
*    "post": {
*      "tags": [
*        "User"
*      ],
*      "summary": "Create User",
*      "description": "",
*      "operationId": "createUser",
*      "produces": [
*        "application/json"
*      ],
*      "parameters": [
*        {
*          "in": "header",
*          "name": "Authorization",
*          "type": "string",
*          "description": "Token JWT"
*        },
*        {
*          "in": "body",
*          "name": "body",
*          "type": "object",
*          "description": "Objecto del usuario a crear.",
*          "required": true,
*          "schema": {
*            "$ref": "#/definitions/User"
*          }
*        }
*      ],
*      "responses": {
*        "200": {
*          "description": "Successful creation",
*          "examples": {
*            "application/json": {
*              "mensaje": "Usuario creado!"
*            }
*          }
*        },
*        "403": {
*          "description": "Forbidden"
*        }
*      }
*    }
*  }
*}
*/
app.post('/api/create/user', async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token)
    {
        return res.sendStatus(403);
    }

    let nombre,
        apellido,
        contrasena,
        username,
        monedaPrefe = '';

    nombre = req.body.nombre; 
    apellido = req.body.apellido; 
    username = req.body.username; 
    contrasena = req.body.contrasena; 
    monedaPrefe = req.body.monedaPrefe; 
  
    let data = {
        nombre: nombre,
        apellido: apellido,
        username: username,
        contrasena: contrasena,
        monedaPrefe: monedaPrefe
    }
    jwt.verify(token, config.jwtKey, (err, decoded) => {
        if(err){
            res.sendStatus(403)
        }
        else{
            let createdUser = createUser(data, req, res);
        }
    })
})

/**
 * @swagger
* {
*  "/api/create/coin": {
*    "post": {
*      "tags": [
*        "Coin"
*      ],
*      "summary": "Create coin",
*      "description": "",
*      "operationId": "createCoin",
*      "produces": [
*        "application/json"
*      ],
*      "parameters": [
*        {
*          "in": "header",
*          "name": "Authorization",
*          "type": "string",
*          "description": "Token JWT"
*        },
*        {
*          "in": "body",
*          "name": "body",
*          "type": "object",
*          "description": "Objecto del usuario a crear.",
*          "required": true,
*          "schema": {
*            "$ref": "#/definitions/Coin"
*          }
*        }
*      ],
*      "responses": {
*        "200": {
*          "description": "Successful creation",
*          "examples": {
*            "application/json": {
*              "mensaje": "Usuario creado!"
*            }
*          }
*        },
*        "403": {
*          "description": "Forbidden"
*        }
*      }
*    }
*  }
*}
*/
app.post('/api/create/coin', async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token)
    {
        return res.sendStatus(403);
    }

    let iduser,
        coin = ''; 
    iduser = req.body.iduser; 
    coin = req.body.coin;
  
    let data = {
        iduser: iduser, 
        coin: coin
    }

    jwt.verify(token, config.jwtKey, (err, decoded) => {
        if(err){
            res.sendStatus(403)
        }
        else{
            let createdCoin = createCoin(data, req, res);
        }
    })
})

/**
 * @swagger
* {
*  "/api/coins/user": {
*    "post": {
*      "tags": [
*        "Coin - User"
*      ],
*      "summary": "Get Coin User",
*      "description": "",
*      "operationId": "getCoinUser",
*      "produces": [
*        "application/json"
*      ],
*      "parameters": [
*        {
*          "in": "header",
*          "name": "Authorization",
*          "type": "string",
*          "description": "Token JWT"
*        },
*        {
*          "in": "body",
*           "name": "object",
*           "description": "Ingresar id del usuario",
*           "required": true,
*            "schema": {
*                "type": "object",
*                "properties": {
*                   "iduser": {
*                       "type": "integer",
*                       "description": "Id del usuario"
*                   },
*               }
*            }
*        }
*      ],
*      "responses": {
*        "200": {
*          "description": "Successful creation",
*          "examples": {
*            "application/json": {
*                    "id": 5,
*                    "iduser": 7,
*                    "coin": "LTC",
*                    "createdAt": "2019-12-01T22:20:28.000Z",
*                    "updatedAt": "2019-12-01T22:20:28.000Z"             
*            }
*          }
*        },
*        "403": {
*          "description": "Forbidden"
*        }
*      }
*    }
*  }
*}
*/
app.post('/api/coins/user', (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token)
    {
        return res.sendStatus(403);
    }

    let iduser = ''; 
    iduser = req.body.iduser; 
  
    let data = {
        iduser: iduser
    }

    jwt.verify(token, config.jwtKey, (err, decoded) => {
        if(err){
            res.sendStatus(403)
        }
        else{
            let coinUser = getCoinUser(data, req, res);
        }
    })
})

 /**
  * @param {object} userData Data del usuario que se quiere buscar
  * @returns {object} id, user, valid = true or false
  */
async function getUser(userData, req, res){
    /**
 * @example
 * var str = 'abc';
 * console.log(repeat(str, 3)); // abcabcabc
 */
    return await User.findOne({
        where: userData,
      }).then(user => {
          return {
                id:user.dataValues.id ,
                user: user.dataValues.nombre,
                valid: true
            }
        })
        .catch(error => {return error});  
}

/**
 * Funcion para buscar las monedas del usuario
 * @param {object} coinUserData Objeto con el id usuario a buscar
 * @param {request} req 
 * @param {response} res 
 */
function getCoinUser(coinUserData, req, res){
    console.log(coinUserData)
    return Coin.findAll({
        raw: true,
        where: coinUserData,
      }).then(coinUser => { res.send(coinUser) })
        .catch(error => {return error});  
}

/**
 * Funcion de creacion de Usuarios
 * @param {object} userData Objecto con la data del modelo de usuario
 * @param {*} req 
 * @param {*} res 
 */
function createUser(userData, req, res){
    return User.create(
        userData,
      )
        .then(user => {res.send('Usuario Creado')})
        .catch(error => {return error});  
}

/**
 * Funcion para crear la criptomoneda del usuario
 * @param {object} coinData Objecto con la data de usuario y moneda
 * @param {*} req 
 * @param {*} res 
 */
function createCoin(coinData, req, res){
    return Coin.create(
        coinData,
      )
        .then(coin => {res.send('Moneda Creada')})
        .catch(error => {return error});  
}

/**
 * Despliegue de la aplicacion de acuerdo al puerto asignado inicialmente
 */
app.listen(PORT, console.log(`Server running on port ${PORT}`))

/**
 * @swagger
 * definitions:
 *   User:
 *      type: "object"
 *      properties:
 *          nombre:
 *              type: "string"
 *          apellido:
 *              type: "string"
 *          username:
 *              type: "string"
 *          contrasena:
 *              type: "string"
 *          monedaPrefe:
 *              type: "string"
 *              description: "Moneda Preferida"
 *              enum:
 *                - "USD"
 *                - "COP"
 *                - "EUR"
 *   Coin:
 *      type: "object"
 *      properties:
 *          iduser:
 *              type: "integer"
 *          coin:
 *              type: "string"
*/
