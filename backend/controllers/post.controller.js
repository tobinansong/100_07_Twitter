import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.models.js";

const USER_PUBLIC_FIELDS = "-password -email";
// uploader.upload() treats any other string as a path on this server and uploads that file.
const IMAGE_SOURCE_REGEX =
  /^(data:image\/[\w.+-]+;base64,[a-zA-Z0-9+/=\n]+|https?:\/\/\S+)$/;

const findPostsNewestFirst = (filter = {}) =>
  Post.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", USER_PUBLIC_FIELDS)
    .populate("comments.user", USER_PUBLIC_FIELDS);

export const getAllPosts = async (req, res) => {
  try {
    const posts = await findPostsNewestFirst();

    res.status(200).json(posts);
  } catch (error) {
    console.error(`Error in getAllPosts controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select("following");
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await findPostsNewestFirst({
      user: { $in: currentUser.following },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(`Error in getFollowingPosts controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (!(await User.exists({ _id: id }))) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await findPostsNewestFirst({ likes: id });

    res.status(200).json(posts);
  } catch (error) {
    console.error(`Error in getLikedPosts controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "_id"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await findPostsNewestFirst({ user: user._id });

    res.status(200).json(posts);
  } catch (error) {
    console.error(`Error in getUserPosts controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    // Express 5 leaves req.body undefined when a request has no parsed body.
    const { text, img } = req.body ?? {};

    if (
      (text !== undefined && typeof text !== "string") ||
      (img !== undefined && typeof img !== "string")
    ) {
      return res.status(400).json({ error: "Post fields must be text" });
    }

    const trimmedText = text?.trim();
    if (!trimmedText && !img) {
      return res.status(400).json({ error: "Post must have text or an image" });
    }

    if (img && !IMAGE_SOURCE_REGEX.test(img)) {
      return res.status(400).json({ error: "Invalid image" });
    }

    if (!(await User.exists({ _id: req.userId }))) {
      return res.status(404).json({ error: "User not found" });
    }

    let imgUrl;
    if (img) {
      const uploadedImage = await cloudinary.uploader.upload(img);
      imgUrl = uploadedImage.secure_url;
    }

    const post = await Post.create({
      user: req.userId,
      text: trimmedText,
      img: imgUrl,
    });

    res.status(201).json(post);
  } catch (error) {
    // Cloudinary rejects with plain objects, using http_code 400 for images it can't read.
    if (error.http_code === 400) {
      return res.status(400).json({ error: "Invalid image" });
    }

    console.error(
      `Error in createPost controller: ${error.error?.message ?? error.message}`
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const post = await Post.findById(id).select("user likes");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.some((likerId) => likerId.equals(req.userId));
    const operator = isLiked ? "$pull" : "$addToSet";

    await Post.updateOne(
      { _id: post._id },
      { [operator]: { likes: req.userId } }
    );

    if (!isLiked && !post.user.equals(req.userId)) {
      await Notification.create({
        from: req.userId,
        to: post.user,
        type: "like",
      });
    }

    res.status(200).json({
      message: isLiked ? "Post unliked successfully" : "Post liked successfully",
    });
  } catch (error) {
    console.error(`Error in likeUnlikePost controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body ?? {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({ text: text.trim(), user: req.userId });
    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.error(`Error in commentOnPost controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!post.user.equals(req.userId)) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    // Image first: destroy() succeeds on a missing image, so a failed delete can be retried.
    if (post.img) {
      // Uploads use no folder, so the public id is the URL's file name without its extension.
      const publicId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(
      `Error in deletePost controller: ${error.error?.message ?? error.message}`
    );
    res.status(500).json({ error: "Internal server error" });
  }
};
