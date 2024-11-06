import { Type } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from '../graphql/types/uuid.js';
import { TUser, TUserList } from '../graphql/schemas.js';

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

export const getUserByIdGQLSchema = (prisma: PrismaClient) => {
  return {
    type: TUser,
    args: {
      id: {
        type: UUIDType,
      },
    },
    resolve: async (_, { id: userId }) => {
      try {
        return prisma.user.findUnique({
          where: {
            id: userId as string,
          },
        });
      } catch {
        return Promise.resolve(null);
      }
    },
  };
};
