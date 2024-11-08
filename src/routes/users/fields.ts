import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { TProfile } from '../profiles/fields.js';
import { TPostList } from '../posts/fields.js';
import { GraphQLContext } from '../../types.js';

export const TUser = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
    profile: {
      type: TProfile,
      resolve: async ({ id, ...r }, _, { prisma }: { prisma: PrismaClient }) => {
        return prisma.profile.findUnique({
          where: {
            userId: id as string,
          },
        });
      },
    },
    posts: {
      type: TPostList,
      resolve: async ({ id }, _, { prisma }: GraphQLContext) =>
        prisma.post.findMany({
          where: {
            authorId: id as string,
          },
        }),
    },
    userSubscribedTo: {
      type: new GraphQLList(TUser),
      resolve: async ({ id }, _, { prisma }) => {
        const result = await prisma.subscribersOnAuthors.findMany({
          where: {
            subscriberId: id as string,
          },
          include: {
            author: true,
            subscriber: true,
          },
        });
        return result.map(({ author }) => author);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(TUser),
      resolve: async ({ id }, _, { prisma }) => {
        const result = await prisma.subscribersOnAuthors.findMany({
          where: {
            authorId: id as string,
          },
          include: {
            author: true,
            subscriber: true,
          },
        });
        return result.map(({ subscriber }) => subscriber);
      },
    },
  }),
});

export const TUserList = new GraphQLList(TUser);
