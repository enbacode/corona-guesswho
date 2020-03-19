const  socketIO = require('socket.io')
const  express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)

app.use(express.static('dist'));

const io = socketIO(server)

let sockets = []

io.on('connection', socket => {

    let userAdded = false

    console.log('new connection')

    socket.on('addUser', username => {

        console.log('adding user', username)
        
        if(userAdded) return
        socket.username = username
        socket.alias = username
        userAdded = true
        socket.emit('login')
        sockets.forEach(user => {
            socket.emit('userJoined', {username: user.username, alias: user.alias})
        })
        sockets.push(socket)
        socket.broadcast.emit('userJoined', {
            username: username,
            alias: username
        })
    })

    socket.on('changeAlias', user => {
        console.log('alias change received', user.username, user.alias)
        const aliasUser = sockets.find(item => item.username == user.username)

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
            socket.broadcast.emit('userLeft', {
                username: socket.username
            })
            sockets = sockets.filter(item => item.username != socket.username)
        }
    })
})


server.listen((process.env.PORT || 80), () => {
    console.log('server started')
})