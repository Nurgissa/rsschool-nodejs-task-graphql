import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Post, PrismaClient, Profile } from '@prisma/client';
import { TProfile } from '../profiles/fields.js';
import { TPostList } from '../posts/fields.js';
import DataLoader from 'dataloader';

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
      resolve: async ({ id }, _, context) =>
        context.loaders.profileByUserIdLoader.load(id as string),
    },
    posts: {
      type: TPostList,
      resolve: async ({ id }, _, context) =>
        context.loaders.postsByAuthorIdLoader.load(id as string),
    },
    userSubscribedTo: {
      type: new GraphQLList(TUser),
      resolve: async ({ id }, _, context) =>
        context.loaders.userSubscribedToLoader.load(id as string),
    },
    subscribedToUser: {
      type: new GraphQLList(TUser),
      resolve: async ({ id }, _, context) =>
        context.loaders.subscribedToUserLoader.load(id as string),
    },
  }),
});

export const TUserList = new GraphQLList(TUser);
