const Post = require('../models/posts');
const headers = require('../service/headers');
const success = require('../service/success');
const error = require('../service/error');


const posts = {
    async getPosts(req, res) {
        const allPost = await Post.find();
        success(res, allPost);
    },
    async createdPost({ body, req, res }) {
        try {
            const data = JSON.parse(body);
            if (data.content) {
                const newPost = await Post.create({
                    name: data.name,
                    content: data.content,
                    image: data.image,
                    tags: data.tags,
                    likes: data.likes
                })
                success(res, newPost);
            } else {
                error(res);
            }
        } catch (err) {
            error(res, err);
        }
    },
    async deleteAllPost(req, res) {
        const data = await Post.deleteMany({});
        success(res, data);
    },
    async deleteOnePost(req, res) {
        try {
            const id = await req.url.split('/').pop();
            const data = await Post.findByIdAndDelete(id);
            success(res, data);
        } catch (err) {
            error(res, err);
        }
    },
    async updateOnePost({ body, req, res }) {
        try {
            const id = await req.url.split("/").pop();
            const data = JSON.parse(body);
            data.content = data.content?.trim();
            if (!data.content) {
                error(res, err);
            }
            const patchPost = await Post.findByIdAndUpdate(id,
                {
                    $set:
                    {
                        "name": data.name,
                        "content": data.content,
                        "image": data.image,
                        "likes": data.likes,
                        "tags": data.tags
                    },

                },
                {
                    // 加這行才會返回更新後的資料，否則為更新前的資料。
                    returnDocument: 'after',
                    // update 相關語法預設 runValidators: false，需手動設寪 true。Doc:https://mongoosejs.com/docs/validation.html#update-validators
                    runValidators: true,
                    new: true
                });
            success(res, patchPost);
        } catch (err) {
            error(res, err);
        }
    }
}

module.exports = posts;