require("./config/db");

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
const bodyParser = require("express").json;
const port = process.env.PORT || 3000;

const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

const setupSocketEvents = require('./events/socket_events');


const SignInRouter = require("./api/auth/sigin_in")
const SignUpRouter = require("./api/auth/sigin_up")
const ProfileRouter = require("./api/auth/profile")
const ForgotPassword = require("./api/auth/ForgotPassword")
const Update = require("./api/auth/Update")
const Delete = require("./api/auth/Delete")
const Avatar = require("./api/auth/image/avatar")
const Background = require("./api/auth/image/background")
const Stories = require("./api/stories/stories")
const Post = require("./api/post/post")
const Feature = require("./api/post/feature")

const ChatsRouter = require("./api/chats/message")

const FriendRouter = require("./api/friends/friends")

app.use(cors({ credentials: true, origin: '*' }));
app.use(cors({ credentials: true, origin: ['http://localhost:3000', 'https://backend-soullink.onrender.com'] }));
app.use(cookieParser());

app.use(bodyParser());

/// User
const userRouter = express.Router();
userRouter.use('/auth', SignInRouter);
userRouter.use('/auth', SignUpRouter);
userRouter.use('/auth', ProfileRouter);
userRouter.use('/auth', ForgotPassword);
userRouter.use('/update', Update);
userRouter.use('/user', Delete);
userRouter.use('/image', Avatar);
userRouter.use('/image', Background);
userRouter.use('/new', Stories);
userRouter.use('/post', Post);
userRouter.use('/post', Feature);

/// Chats
userRouter.use('/chats', ChatsRouter);

/// Friend
userRouter.use('/friends', FriendRouter);

app.use('/api/v1', userRouter);

/// Admin
/// CMS


// Thiết lập Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected');

    setupSocketEvents(socket, io);

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });

});


// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`listening on ${port}`);
});