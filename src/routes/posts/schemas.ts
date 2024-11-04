import { Type } from '@fastify/type-provider-typebox';
import { userFields } from '../users/schemas.js';
import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql/index.js';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from '../graphql/types/uuid.js';

export const postFields = {
  id: Type.String({
    format: 'uuid',
  }),
  title: Type.String(),
  content: Type.String(),
  authorId: userFields.id,
};

export const postSchema = Type.Object({
  ...postFields,
});

export const getPostByIdSchema = {
  params: Type.Object(
    {
      postId: postFields.id,
    },
    {
      additionalProperties: false,
    },
  ),
};

export const createPostSchema = {
  body: Type.Object(
    {
      title: postFields.title,
      content: postFields.content,
      authorId: postFields.authorId,
    },
    {
      additionalProperties: false,
    },
  ),
};

export const changePostByIdSchema = {
  params: getPostByIdSchema.params,
  body: Type.Partial(
    Type.Object({
      title: postFields.title,
      content: postFields.content,
    }),
    {
      additionalProperties: false,
    },
  ),
};

/* GraphQL schemas */
export const TPost = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: {
      type: UUIDType,
    },
    title: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
    },
    authorId: {
      type: UUIDType,
    },
  },
});

export const TPostList = new GraphQLList(TPost);

export const getAllPostsGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TPostList,
    resolve: async () => prisma.post.findMany(),
  };
};

export const getPostByIdGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TPost,
    args: {
      id: {
        type: UUIDType,
      },
    },
    resolve: async (_, { id: postId }) => {
      try {
        return prisma.post.findUnique({
          where: {
            id: postId as string,
          },
        });
      } catch (e) {
        return Promise.resolve(null);
      }
    },
  };
};
