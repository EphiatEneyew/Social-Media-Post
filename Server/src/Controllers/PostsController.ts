const path = require("path");
import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import Post from "./../models/postModel";
import asyncWrapper from "./../utils/asyncWrapper";
import APIfeatures from "../utils/APIFeatures";
import AppError from "../utils/appError";
import User from "../models/userModel";

const app = express();
// Define the custom request type
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const addPost = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // console.log("Request body:", req.body);
    // console.log("Files:", req.files);

    const files = req.files as {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };

    if (files.image && files.image.length > 0) {
      const imagePath = files.image[0].path.replace(
        path.join(__dirname, "../../public"),
        ""
      );
      req.body.imagePath = imagePath;
    }

    if (files.video && files.video.length > 0) {
      const videoPath = files.video[0].path.replace(
        path.join(__dirname, "../../public"),
        ""
      );
      req.body.videoContent = videoPath;
    }

    req.body.author = req.user.name;
    req.body.user = req.user.id;

    const newPost = await Post.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Post created successfully",
      data: {
        newPost,
      },
    });
  }
);

export const updatePost = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id;
    // console.log(req.body);

    // Find the existing post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        status: "fail",
        message: "Post not found",
      });
    }

    const files = req.files as {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };

    if (files.image && files.image.length > 0) {
      const imagePath = files.image[0].path.replace(
        path.join(__dirname, "../../public"),
        ""
      );
      req.body.imagePath = imagePath;
    }

    if (files.video && files.video.length > 0) {
      const videoPath = files.video[0].path.replace(
        path.join(__dirname, "../../public"),
        ""
      );
      req.body.videoContent = videoPath;
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: "fail",
        message: "User not authorized to update this post",
      });
    }

    req.body.author = req.user.name;
    req.body.user = req.user.id;

    const updatedPost = await Post.findByIdAndUpdate(postId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: req.file
        ? "File updated successfully"
        : "Data updated successfully",
      data: {
        updatedPost,
      },
    });
  }
);

export const getAllPosts: RequestHandler = asyncWrapper(
  async (req, res, next) => {
    let filter = {};
    if (req.params.userId) filter = { user: req.params.userId };

    let initialQuery = Post.find(filter);

    const countFeatures = new APIfeatures(initialQuery, req.query)
      .filter()
      .search()
      .sort();

    const totalPosts = await countFeatures.query.countDocuments();

    const dataFeatures = new APIfeatures(Post.find(filter), req.query)
      .filter()
      .search()
      .sort()
      .limit()
      .paginate();

    // Fetch the posts based on the applied features
    const posts = await dataFeatures.query;

    res.status(200).json({
      status: "success",
      result: posts.length,
      totalPosts, // Total posts matching the filter criteria in the database
      data: posts,
    });
  }
);

export const getPost: RequestHandler = asyncWrapper(async (req, res, next) => {
  const post = await Post.findById(req.params.postId).populate("user");

  res.status(200).json({
    status: "Success",
    data: {
      post,
    },
  });
});

export const deletePost: RequestHandler = asyncWrapper(
  async (req, res, next) => {
    // console.log("request: " + req.params.postId);

    const post = await Post.findByIdAndDelete(req.params.postId);

    if (!post) {
      return next(new AppError("No post found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const getMyPost = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // console.log(req.user.id);
    const myPost = await Post.find({ user: req.user._id });

    if (!myPost) {
      return next(new AppError("You have not posted so far", 404));
    }

    res.status(201).json({
      status: "success",
      data: {
        myPost,
      },
    });
  }
);

export const deleteAllMyPost = asyncWrapper(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const posts = await Post.deleteMany({ user: req.user.id });

    if (!posts) {
      return next(new AppError("You have no post", 404));
    }

    await User.findByIdAndUpdate(
      req.user.id,
      { numberOfPosts: 0 },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      status: "success",
      message: "All your posts are delete",
      data: null,
    });
  }
);
