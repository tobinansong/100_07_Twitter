import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
  destroyImage,
  isImageSource,
  uploadImage,
} from "../lib/utils/cloudinaryImage.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.models.js";

const SUGGESTED_USERS_LIMIT = 4;
// Preset avatars ship with the frontend, so they're stored as paths instead of being uploaded.
const PRESET_AVATAR_REGEX = /^\/avatars\/[\w-]+\.png$/;
const EDITABLE_TEXT_FIELDS = [
  "fullName",
  "username",
  "email",
  "bio",
  "link",
  "profileImg",
  "coverImg",
  "currentPassword",
  "newPassword",
];

// "" clears an image, and sending the stored value again leaves it alone.
const isAcceptableImage = (value, current) =>
  value === undefined || value === "" || value === current || isImageSource(value);

// Returns the value to store, adding anything uploaded to `uploads` for cleanup if the request fails.
const storeImage = async (value, current, uploads) => {
  if (value === undefined || value === current) return current;
  if (!isImageSource(value)) return value;

  const url = await uploadImage(value);
  uploads.push(url);
  return url;
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -email"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(`Error in getUserProfile controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select("following");
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // aggregate() doesn't cast strings to ObjectIds, so use the ids from the document.
    const suggestedUsers = await User.aggregate([
      { $match: { _id: { $nin: [currentUser._id, ...currentUser.following] } } },
      { $sample: { size: SUGGESTED_USERS_LIMIT } },
      { $project: { password: 0, email: 0 } },
    ]);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error(`Error in getSuggestedUsers controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (req.userId.equals(id)) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId).select("following"),
      User.findById(id).select("_id"),
    ]);
    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.some((followedId) =>
      followedId.equals(targetUser._id)
    );
    const operator = isFollowing ? "$pull" : "$addToSet";

    await Promise.all([
      User.updateOne(
        { _id: currentUser._id },
        { [operator]: { following: targetUser._id } }
      ),
      User.updateOne(
        { _id: targetUser._id },
        { [operator]: { followers: currentUser._id } }
      ),
    ]);

    if (!isFollowing) {
      await Notification.create({
        from: currentUser._id,
        to: targetUser._id,
        type: "follow",
      });
    }

    res.status(200).json({
      message: isFollowing
        ? "User unfollowed successfully"
        : "User followed successfully",
    });
  } catch (error) {
    console.error(`Error in followUnfollowUser controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  const uploads = [];

  try {
    // Express 5 leaves req.body undefined when a request has no parsed body.
    const body = req.body ?? {};

    const hasInvalidField = EDITABLE_TEXT_FIELDS.some(
      (field) => body[field] !== undefined && typeof body[field] !== "string"
    );
    if (hasInvalidField) {
      return res.status(400).json({ error: "Profile fields must be text" });
    }

    const {
      fullName,
      username,
      email,
      bio,
      link,
      profileImg,
      coverImg,
      currentPassword,
      newPassword,
    } = body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      !(isAcceptableImage(profileImg, user.profileImg) || PRESET_AVATAR_REGEX.test(profileImg)) ||
      !isAcceptableImage(coverImg, user.coverImg)
    ) {
      return res.status(400).json({ error: "Invalid image" });
    }

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Both current password and new password are required",
        });
      }

      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (await User.findOne({ email })) {
        return res.status(400).json({ error: "Email is already taken" });
      }
    }

    if (username && username !== user.username) {
      if (await User.findOne({ username })) {
        return res.status(400).json({ error: "Username is already taken" });
      }
    }

    const previousImages = [user.profileImg, user.coverImg];

    // Required fields keep their value when blank; optional ones can be cleared with "".
    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio ?? user.bio;
    user.link = link ?? user.link;
    // Uploaded after every check above, so a rejected request doesn't upload anything.
    user.profileImg = await storeImage(profileImg, user.profileImg, uploads);
    user.coverImg = await storeImage(coverImg, user.coverImg, uploads);

    await user.save();

    // The profile is already saved, so a failed cleanup only leaves an unused image behind.
    await Promise.all(
      previousImages
        .filter((url) => url && url !== user.profileImg && url !== user.coverImg)
        .map((url) =>
          destroyImage(url).catch((error) =>
            console.error(
              `Error removing replaced image: ${error.error?.message ?? error.message}`
            )
          )
        )
    );

    const { password, ...userResponse } = user.toObject();
    res.status(200).json(userResponse);
  } catch (error) {
    // Nothing was saved, so nothing points at what this request uploaded.
    await Promise.allSettled(uploads.map(destroyImage));

    // Cloudinary rejects with plain objects, using http_code 400 for images it can't read.
    if (error.http_code === 400) {
      return res.status(400).json({ error: "Invalid image" });
    }

    console.error(
      `Error in updateUserProfile controller: ${error.error?.message ?? error.message}`
    );
    res.status(500).json({ error: "Internal server error" });
  }
};
