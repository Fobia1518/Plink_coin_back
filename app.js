const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;
const { User, Coin } = require('./models');
const jwt = require('jsonwebtoken');
const config = require('./config/jwt');
const unirest = require("unirest");
const req = unirest("GET", "https://bravenewcoin-v1.p.rapidapi.com/convert");

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Redirect
console.log('Api');
app.get('/', function(req, res){
    res.redirect('/api');
 });

// generica
app.get('*',(req,res) => res.json({message: "Hello world"}));

//API running
app.get('/api',(req,res) => res.json({message: "API runnig"}));

//login
app.post('/api/login', async (req, res) => { //Login
    let user = ''; 
    let pass = ''; 
    user = req.body.user; 
    pass = req.body.pass; 
  
    let data = { 
        "username": user, 
        "contrasena":pass, 
    } 
    let validUser = await getUser(data, req, res);
    let token = jwt.sign(validUser, config.jwtKey, { expiresIn: '1h' }, (err, token) =>{
        res.json({
            token: token
        })
    });
}) 

//mostrar usuarios
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

//crear usuario
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
    contrasena = req.body.contrasena; 
    username = req.body.username; 
    monedaPrefe = req.body.monedaPrefe; 
  
    let data = {
        nombre: nombre,
        apellido: apellido,
        contrasena: contrasena,
        username: username,
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

//agregar criptomonedas usuario
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

//mostrar criptomonedas usuario
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

//top 3 de monedas comparando con el usuario de consulta


/**
 * Funciones llamadas desde los endpoints
 */

async function getUser(userData, req, res){
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

function getCoinUser(coinUserData, req, res){
    console.log(coinUserData)
    return Coin.findAll({
        raw: true,
        where: coinUserData,
      }).then(coinUser => { res.send(coinUser) })
        .catch(error => {return error});  
}
// function getCoinUser(coinUserData, req, res){
//     console.log(coinUserData)
//     return Coin.findAll({
//         include: [{
//             model: User,
//             where: {id: coinUserData.iduser}
//         }],
//         raw: true,
//         where: coinUserData,
//       }).then(coinUser => console.log(coinUser))
//         .catch(error => {return error});  
// }

function createUser(userData, req, res){
    return User.create(
        userData,
      )
        .then(user => {res.send('Usuario Creado')})
        .catch(error => {return error});  
}

function createCoin(coinData, req, res){
    return Coin.create(
        coinData,
      )
        .then(coin => {res.send('Moneda Creada')})
        .catch(error => {return error});  
}


app.listen(PORT, console.log(`Server running on port ${PORT}`))

