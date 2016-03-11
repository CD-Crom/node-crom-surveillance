'use strict'
const util     = require('util')
  ,   http     = require('http')
  ,   fs       = require('fs')
  ,   express  = require('express')
  ,   socketio = require('socket.io')
  ,   Cam      = require('./cam')

const cam = new Cam({
  // loop: 5
})

let app = express()
let server = http.createServer(app)
let io = socketio(server)

io.on('connection', (socket) => {
    if (app.get('streaming') === false) {
        app.set('streaming', true)
        cam.capture()
    }

    socket.on('disconnect', () => {
        if (io.engine.clientsCount == 0) {
            app.set('streaming', false)
        }
    })
})

cam.onImage((imagePath) => {
    fs.readFile(imagePath, (err, buffer) => {

        util.log("Sending image to " + io.engine.clientsCount + " clients");

        io.emit('camfeed', {
            date: new Date(), 
            image: buffer.toString('base64')
        })

        setTimeout(() => {
            if (app.get('streaming') === true) {
                cam.capture()
            }
        }, 100)
    })
})

app.set('view engine', 'ejs')
app.set('views', 'lib/public')
app.set('streaming', false)
app.get('/', (req, res, next) => {
    res.render('index', {
        HOST: req.header['x-host'] || ''
    })
})
app.use(express.static(__dirname + '/public'))

server.listen(3000);