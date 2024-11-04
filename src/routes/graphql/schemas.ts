import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql/index.js';
import { UUIDType } from './types/uuid.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const EMemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const TMemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: {
      type: EMemberTypeId,
    },
    discount: {
      type: GraphQLFloat,
    },
    postsLimitPerMonth: {
      type: GraphQLInt,
    },
  },
});
export const TMemberTypeList = new GraphQLList(TMemberType);

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
    profile: {
      type: TProfile,
    },
  },
});

export const TUserList = new GraphQLList(TUser);
