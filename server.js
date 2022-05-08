const http = require('http');
const mongoose = require('mongoose');
const Post = require('./models/posts');
const headers = require('./service/headers');
const success = require('./service/success');
const error = require('./service/error');
const { findByIdAndDelete, findByIdAndUpdate } = require('./models/posts');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
    `<password>`,
    process.env.DATABASE_PASSWORD
)
// mongoose.connect('mongodb://localhost:27017/Post').then(() => {
//     console.log('資料庫連線成功');
// }).catch(err => {
//     console.log(err);
// });

mongoose.connect(DB).then(() => {
    console.log('資料庫連線成功');
}).catch(err => {
    console.log(err);
});

const requestListener = async (req, res) => {
    let body = "";
    req.on('data', chunk => {
        body += chunk;
    })
    if (req.url === "/posts" && req.method === "GET") {
        const data = await Post.find();
        success(res, data);
    } else if (req.url === "/posts" && req.method === "POST") {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const newPost = await Post.create({
                    name: data.name,
                    content: data.content,
                    image: data.image,
                    tags: data.tags,
                    likes: data.likes
                })
                success(res, newPost);
            } catch (err) {
                error(res, err);
            }
        })
    } else if (req.url === "/posts" && req.method === "DELETE") {
        const data = await Post.deleteMany({});
        success(res, data);
    } else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
        const id = await req.url.split('/').pop();
        const data = await Post.findByIdAndDelete(id);

        success(res, data);
    } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
        const id = await req.url.split("/").pop();
        const data = JSON.parse(body);
        const patchPost = await Post.findByIdAndUpdate(id,
            {
                $set:
                {
                    "name": data.name,
                    "content": data.content,
                    "image": data.image,
                    "likes": data.likes,
                    "tags": data.tags
                }
            });
        success(res, patchPost);
        res.end();

    } else if (req.method === "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
    } else {
        res.writeHead(404, headers);
        res.writeHead(JSON.stringify({
            "status": "false",
            "message": "無此網站路由"
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);