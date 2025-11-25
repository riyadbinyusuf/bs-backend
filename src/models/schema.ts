import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 20 }).default('user'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const visibilityEnum = pgEnum('visibility', ['public', 'private', 'friends']);

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  videoUrl: varchar('video_url', { length: 255 }),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  isPublished: boolean('is_published').default(true), 
  visibility: visibilityEnum().default('public'),
  userId: serial('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const postLikes = pgTable('post_likes', {
  id: serial('id').primaryKey(),
  postId: serial('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: serial('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const postComments = pgTable('post_comments', {
  id: serial('id').primaryKey(),
  commentText: text('comment_text').notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  postId: serial('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: serial('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const commentLikes = pgTable('comment_likes', {
  id: serial('id').primaryKey(),
  commentId: serial('comment_id')
    .notNull()
    .references(() => postComments.id, { onDelete: 'cascade' }),
  userId: serial('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(postComments),
  likes: many(postLikes),
}));

export const commentsRelations = relations(postComments, ({ one, many }) => ({
  user: one(users, { fields: [postComments.userId], references: [users.id] }),
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  likes: many(commentLikes)
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(postComments),
  likes: many(postLikes),
}));

export const likesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  user: one(users, { fields: [commentLikes.userId], references: [users.id] }),
  comment: one(postComments, { fields: [commentLikes.commentId], references: [postComments.id] }),
}));