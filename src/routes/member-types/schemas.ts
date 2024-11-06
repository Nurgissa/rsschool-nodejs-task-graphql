import { Type } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import { EMemberTypeId, TMemberType, TMemberTypeList } from '../graphql/schemas.js';

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
