import { Type } from '@fastify/type-provider-typebox';
import { EMemberTypeId, memberTypeFields } from '../member-types/schemas.js';
import { userFields } from '../users/schemas.js';
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { PrismaClient } from '@prisma/client';

export const profileFields = {
  id: Type.String({
    format: 'uuid',
  }),
  isMale: Type.Boolean(),
  yearOfBirth: Type.Integer(),
  userId: userFields.id,
  memberTypeId: memberTypeFields.id,
};

export const profileSchema = Type.Object({
  ...profileFields,
});

export const getProfileByIdSchema = {
  params: Type.Object(
    {
      profileId: profileFields.id,
    },
    {
      additionalProperties: false,
    },
  ),
};

export const createProfileSchema = {
  body: Type.Object(
    {
      isMale: profileFields.isMale,
      yearOfBirth: profileFields.yearOfBirth,
      memberTypeId: profileFields.memberTypeId,
      userId: profileFields.userId,
    },
    {
      additionalProperties: false,
    },
  ),
};

export const changeProfileByIdSchema = {
  params: getProfileByIdSchema.params,
  body: Type.Partial(
    Type.Object({
      isMale: profileFields.isMale,
      yearOfBirth: profileFields.yearOfBirth,
      memberTypeId: profileFields.memberTypeId,
    }),
    {
      additionalProperties: false,
    },
  ),
};

/* GraphQL schemas */
export const TProfile = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: {
      type: GraphQLString,
    },
    isMale: {
      type: GraphQLBoolean,
    },
    yearOfBirth: {
      type: GraphQLInt,
    },
    memberTypeId: {
      type: EMemberTypeId,
    },
  },
});

export const TProfileList = new GraphQLList(TProfile);

export const getAllProfilesGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TProfileList,
    resolve: async () => prisma.profile.findMany(),
  };
};

export const getProfileByIdGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TProfile,
    args: {
      id: {
        type: GraphQLString,
      },
    },
    resolve: async (_, { id: profileId }) => {
      return prisma.profile.findUnique({
        where: {
          id: profileId as string,
        },
      });
    },
  };
};
