const  socketIO = require('socket.io')
const  express = require('express')
const http = require('http')
const fs = require('fs')
const fetch = require('node-fetch')
require('dotenv').config()

const app = express()
const server = http.createServer(app)

app.use(express.static('dist'));

const io = socketIO(server)

let sockets = []
let currentIndex = -1

const aliases = JSON.parse(fs.readFileSync('./aliases.json'))

const cachedImageUrls = []

function getRandomAlias() {
    return aliases[Math.floor(Math.random() * aliases.length)]
}

app.get('/alias', (request, response) => {
    response.send(JSON.stringify([getRandomAlias()]))
})

app.get('/image', (request, response) => {
    const q = request.param('q')
    const cache = cachedImageUrls.find(item => item.query == q)
    if(cache) {
        response.send(JSON.stringify([cache.image]))
    }
    else {
        fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyBY7rmwpqw4CvR1rbLbnyxFPvlHM-o04-o&q=${encodeURI(q)}&cx=004773877283740196199:kstva1a2x93&searchType=image&num=1`)
        .then(res => res.json())
        .then(json => {
            cachedImageUrls.push({
                query: q,
                image: json.items[0].link
            })
            response.send(JSON.stringify([json.items[0].link]))

        })
        .catch(err => {
            response.status(503).send(JSON.stringify(['error']))
        })
    }
})

io.on('connection', socket => {

    console.log('new connection')
    let userAdded = false

    socket.on('addUser', ({ username, lobby }) => {

        if(userAdded) return
        socket.username = username
        socket.alias = getRandomAlias()
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
            username: socket.username,
            alias: socket.alias
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
            socket.to(socket.lobby).emit('aliasChange', {
                username: aliasUser.username,
                alias: aliasUser.alias
            })
        }
    })

    socket.on('moveToNext', () => {
        const room = sockets.filter(item => item.lobby == socket.lobby)
        currentIndex = (currentIndex + 1) % room.length
        console.log('moving to next ', room[currentIndex].username, socket.lobby)
        socket.to(socket.lobby).emit('setCurrentUser', {
            username: room[currentIndex].username
        })
        socket.emit('setCurrentUser', {
            username: room[currentIndex].username
        })
    })
    socket.on('moveToPrevious', () => {
        const room = sockets.filter(item => item.lobby == socket.lobby)
        currentIndex = (currentIndex - 1) % room.length
        if(currentIndex < 0)
            currentIndex = room.length - 1
        console.log('moving to prev ', room[currentIndex].username)
        socket.to(socket.lobby).emit('setCurrentUser', {
            username: room[currentIndex].username
        })
        socket.emit('setCurrentUser', {
            username: room[currentIndex].username
        })
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
            }, 1000 * 60 * 30)
        }
    })
})


server.listen((process.env.PORT || 80), () => {
    console.log('server started')
})