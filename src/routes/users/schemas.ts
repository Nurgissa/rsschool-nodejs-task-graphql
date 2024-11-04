import { Type } from '@fastify/type-provider-typebox';
import { GraphQLObjectType, GraphQLString } from 'graphql/index.js';
import { GraphQLFloat, GraphQLList } from 'graphql';
import { PrismaClient } from '@prisma/client';

export const userFields = {
  id: Type.String({
    format: 'uuid',
  }),
  name: Type.String(),
  balance: Type.Number(),
};

export const userSchema = Type.Object({
  ...userFields,
});

export const getUserByIdSchema = {
  params: Type.Object(
    {
      userId: userFields.id,
    },
    {
      additionalProperties: false,
    },
  ),
};

export const createUserSchema = {
  body: Type.Object(
    {
      name: userFields.name,
      balance: userFields.balance,
    },
    {
      additionalProperties: false,
    },
  ),
};

export const changeUserByIdSchema = {
  params: getUserByIdSchema.params,
  body: Type.Partial(
    Type.Object({
      name: userFields.name,
      balance: userFields.balance,
    }),
    {
      additionalProperties: false,
    },
  ),
};

/* GraphQL schemas */
export const TUser = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
  },
});

export const TUserList = new GraphQLList(TUser);

export const getAllUsersGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TUserList,
    resolve: async () => prisma.user.findMany(),
  };
};

export const getUserByIdGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TUser,
    args: {
      id: {
        type: GraphQLString,
      },
    },
    resolve: async (_, { id: userId }) => {
      return prisma.user.findUnique({
        where: {
          id: userId as string,
        },
      });
    },
  };
};
