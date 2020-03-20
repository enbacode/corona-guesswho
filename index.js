const  socketIO = require('socket.io')
const  express = require('express')
const http = require('http')
require('dotenv').config()

const app = express()
const server = http.createServer(app)

app.use(express.static('dist'));

const io = socketIO(server)

let sockets = []

io.on('connection', socket => {

    let userAdded = false

    console.log('new connection')

    socket.on('addUser', ({ username, lobby }) => {

        console.log('adding user', username)
        
        if(userAdded) return
        socket.username = username
        socket.alias = username
        socket.lobby = lobby
        userAdded = true
        socket.emit('login')
        socket.join(socket.lobby)
        sockets.filter(item => item.lobby == socket.lobby).forEach(user => {
            socket.emit('userJoined', {username: user.username, alias: user.alias})
        })
        sockets.push(socket)
        socket.to(lobby).emit('userJoined', {
            username: username,
            alias: username
        })
    })

    socket.on('changeAlias', user => {
        console.log('alias change received', user.username, user.alias)
        const aliasUser = sockets.find(item => item.username == user.username && item.lobby == socket.lobby)

        if(aliasUser) {
            aliasUser.alias = user.alias
            console.log('new alias for', aliasUser.username, aliasUser.alias)
            socket.broadcast.emit('aliasChange', {
                username: aliasUser.username,
                alias: aliasUser.alias
            })
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        if(userAdded) {
            socket.to(socket.lobby).emit('userLeft', {
                username: socket.username
            })
            sockets = sockets.filter(item => item.username != socket.username)
        }
    })
})


server.listen((process.env.PORT || 80), () => {
    console.log('server started')
})