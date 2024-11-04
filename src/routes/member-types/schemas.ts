import { Type } from '@fastify/type-provider-typebox';
import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType } from 'graphql';
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
const EMemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: "BASIC" },
    BUSINESS: { value: "BUSINESS" },
  },
});

const TMemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: {
      type: EMemberTypeId
    },
    discount: {
      type: GraphQLFloat
    },
    postsLimitPerMonth: {
      type: GraphQLInt
    }
  }
})

const TMemberTypeList = new GraphQLList(TMemberType);

export const getMemberTypesSchema = (prisma: PrismaClient) => {
  return {
    type: TMemberTypeList,
    resolve: async () => prisma.memberType.findMany()
  }
}



