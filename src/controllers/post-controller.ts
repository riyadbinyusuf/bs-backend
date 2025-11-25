import { Request, Response } from "express";
import { logger } from "../utils/logger";
import {
  commentLikes,
  postComments,
  postLikes,
  posts,
  users,
} from "../models/schema";
import { db } from "../config/db";
import { and, desc, eq, like, lt, lte, or, SQL, sql } from "drizzle-orm";
import {
  validateCommentBody,
  validatePostBody,
} from "../validations/post-validation";

export const createPost = async (req: Request, res: Response) => {
  try {
    const { text, imageUrl, visibility } = req.body;
    // validate user request body using zod;
    const payload = validatePostBody.parse({ text, imageUrl, visibility });
    if (!payload) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }
    const createdPost = await db
      .insert(posts)
      .values({
        text: payload.text ?? "",
        imageUrl: payload?.imageUrl ?? null,
        visibility: payload.visibility,
        userId: Number(req.userId),
      })
      .returning();

    if (!createdPost.length) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create post",
      });
    }

    const post = createdPost[0];

    logger.success(`New post created`);

    res.status(201).json({
      status: "success",
      message: "Post created successfully",
      data: {
        post: {
          _id: post.id,
          text: post.text,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          userId: post.userId,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
        },
      },
    });
  } catch (error) {
    logger.error("Post creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const postsList = await db
      .select()
      .from(posts)
      .where(eq(users.id, Number(req.userId)))
      .limit(10)
      .offset(10);

    if (!postsList) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: {
        posts: postsList,
      },
    });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { commentText, imageUrl } = req.body;
    // validate user request body using zod;
    const payload = validateCommentBody.parse({ commentText, imageUrl });
    if (!payload) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }
    const createdComment = await db
      .insert(postComments)
      .values({
        commentText: payload.commentText,
        imageUrl: payload.imageUrl,
        postId: Number(postId),
        userId: Number(req.userId),
      })
      .returning();

    if (!createdComment.length) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create comment",
      });
    }

    const comment = createdComment[0];

    logger.success(`New comment created`);

    res.status(201).json({
      status: "success",
      message: "Comment created successfully",
      data: {
        post: {
          _id: comment.id,
          commentText: comment.commentText,
          imageUrl: comment.imageUrl,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          userId: comment.userId,
        },
      },
    });
  } catch (error) {
    logger.error("Comment creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getPostsFeed = async (req: Request, res: Response) => {
  try {
    const { limit, cursor }: { limit?: string; cursor?: Date } = req.query;
    const cursorDate = cursor ? new Date(cursor) : undefined;

    const filters: (SQL<unknown> | undefined)[] = [];

    const currentUserId = Number(req.userId);

    if (cursorDate) {
      filters.push(lt(posts.createdAt, cursorDate));
    }

    const visibilityFilter = or(
      eq(posts.userId, currentUserId),
      eq(posts.visibility, "public")
    );

    filters.push(visibilityFilter);

    const data = await db.query.posts.findMany({
      limit: limit ? Number(limit) : 20,
      orderBy: desc(posts.createdAt),
      where: and(...(filters.filter(Boolean) as SQL<unknown>[])),
      with: {
        likes: {
          limit: 10,
          orderBy: (likes, { desc }) => desc(likes.createdAt),
        },
        user: {
          columns: {
            password: false,
          },
        },
        comments: {
          limit: 5,
          orderBy: (comments, { desc }) => desc(comments.id),
          with: {
            user: true,
            likes: {
              limit: 10,
              orderBy: (likes, { desc }) => desc(likes.createdAt),
            },
          },
          extras: {
            totalLikes:
              sql<number>`(SELECT COUNT(*) FROM ${commentLikes} AS cl WHERE cl.comment_id = ${postComments.id})`.as(
                "totalLikes"
              ),
          },
        },
      },
      extras: {
        totalLikes: sql<number>`
      (SELECT COUNT(*) FROM ${postLikes} AS pl WHERE pl.post_id = ${posts.id})
    `.as("totalLikes"),

        totalComments: sql<number>`
      (SELECT COUNT(*) FROM ${postComments} AS pc WHERE pc.post_id = ${posts.id})
    `.as("totalComments"),
      },
    });

    res.json({
      status: "success",
      data: {
        posts: data,
        cursor: data.length
          ? data[data.length - 1].createdAt?.toISOString()
          : undefined,
      },
    });
  } catch (error) {
    logger.error("Get posts error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getPostsComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const {
      limit,
      cursor,
    }: { limit?: string; cursor?: Date; postId?: string } = req.query;
    const data = await db.query.postComments.findMany({
      limit: limit ? Number(limit) : 20,
      orderBy: (desc) => [desc.createdAt],
      where:
        eq(postComments.postId, Number(postId)) &&
        (cursor ? lt(postComments.createdAt, cursor) : undefined),
      with: {
        user: true,
      },
    });

    res.json({
      status: "success",
      data: {
        comments: data,
      },
    });
  } catch (error) {
    logger.error("Get post comments error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
