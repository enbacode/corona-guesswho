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

    console.log('new connection')
    let userAdded = false

    socket.on('addUser', ({ username, lobby }) => {

        if(userAdded) return
        socket.username = username
        socket.alias = username
        socket.lobby = lobby
        userAdded = true
        socket.emit('login')
        socket.join(socket.lobby)
        console.log(`user ${socket.username} joined ${socket.lobby}`)
        sockets.filter(item => item.lobby == socket.lobby).forEach(user => {
            socket.emit('userJoined', {username: user.username, alias: user.alias})
        })
        sockets.push(socket)
        socket.to(lobby).emit('userJoined', {
            username: username,
            alias: username
        })
    })

    socket.on('rejoin', ({ username }) => {
        console.log('rejoin request ', username)
        let oldSocketIndex = sockets.findIndex(item => item.username == username)
        if(oldSocketIndex == -1) return
        socket.username = username
        socket.lobby = sockets[oldSocketIndex].lobby
        socket.alias = sockets[oldSocketIndex].alias
        socket.join(socket.lobby)
        clearTimeout(sockets[oldSocketIndex].timeout)
        sockets[oldSocketIndex] = socket
        console.log(`user ${socket.username} rejoined to ${socket.lobby}`)
        userAdded = true
        socket.to(socket.lobby).emit('userRejoined', {
            username: socket.username,
            alias: socket.alias
        })
    })

    socket.on('changeAlias', user => {
        const aliasUser = sockets.find(item => item.username == user.username && item.lobby == socket.lobby)

        if(aliasUser) {
            aliasUser.alias = user.alias
            console.log('new alias for', aliasUser.username, ': ', aliasUser.alias)
            socket.broadcast.emit('aliasChange', {
                username: aliasUser.username,
                alias: aliasUser.alias
            })
        }
    })

    socket.on('disconnect', () => {
        console.log(`user ${socket.username} disconnected`)
        if(userAdded) {
            socket.to(socket.lobby).emit('userLost', {
                username: socket.username,
                lastSeen: Date.now()
            })
            socket.timeout = setTimeout(() => {
                console.log(`user ${socket.username} timed out`)
                socket.to(socket.lobby).emit('userLeft', {
                    username: socket.username
                })
                sockets = sockets.filter(item => item.username != socket.username)
            }, 1000 * 60 * 1)
        }
    })
})


server.listen((process.env.PORT || 80), () => {
    console.log('server started')
})