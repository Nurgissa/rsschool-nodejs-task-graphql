import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
} from 'graphql';
import { PrismaClient } from '@prisma/client';

export enum MemberTypeId {
  BASIC = 'BASIC',
  BUSINESS = 'BUSINESS',
}

export const memberTypeFields = {
  id: Type.String({
    pattern: Object.values(MemberTypeId).join('|'),
  }),
  discount: Type.Number(),
  postsLimitPerMonth: Type.Integer(),
};

export const memberTypeSchema = Type.Object({
  ...memberTypeFields,
});

export const getMemberTypeByIdSchema = {
  params: Type.Object(
    {
      memberTypeId: memberTypeFields.id,
    },
    {
      additionalProperties: false,
    },
  ),
};

/* GraphQL schemas */
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

export const getAllMemberTypesGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TMemberTypeList,
    resolve: async () => prisma.memberType.findMany(),
  };
};

export const getMemberTypeByIdGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TMemberType,
    args: {
      id: {
        type: EMemberTypeId,
      },
    },
    resolve: async (_, { id: memberTypeId }) => {
      return prisma.memberType.findUnique({
        where: {
          id: memberTypeId as string,
        },
      });
    },
  };
};
