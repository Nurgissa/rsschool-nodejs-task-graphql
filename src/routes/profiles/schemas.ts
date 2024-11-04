import { Type } from '@fastify/type-provider-typebox';
import { EMemberTypeId, memberTypeFields } from '../member-types/schemas.js';
import { userFields } from '../users/schemas.js';
import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLObjectType } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from '../graphql/types/uuid.js';

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
      type: UUIDType,
    },
    isMale: {
      type: GraphQLBoolean,
    },
    yearOfBirth: {
      type: GraphQLInt,
    },
    userId: {
      type: UUIDType,
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
        type: UUIDType,
      },
    },
    resolve: async (_, { id: profileId }) => {
      try {
        return prisma.profile.findUnique({
          where: {
            id: profileId as string,
          },
        });
      } catch {
        return Promise.resolve(null);
      }
    },
  };
};
