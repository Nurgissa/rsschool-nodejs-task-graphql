import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { Post, Profile, User } from '@prisma/client';
import { EMemberTypeId, TMemberType, TMemberTypeList } from '../member-types/fields.js';
import { TProfile, TProfileList } from '../profiles/fields.js';
import { TUser, TUserList } from '../users/fields.js';
import { TPost, TPostList } from '../posts/fields.js';
import { GraphQLContext } from '../../types.js';

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

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      memberTypes: {
        type: TMemberTypeList,
        resolve: async (_, __, { prisma }: GraphQLContext) =>
          prisma.memberType.findMany(),
      },
      memberType: {
        type: TMemberType,
        args: {
          id: {
            type: EMemberTypeId,
          },
        },
        resolve: async (_, { id }, { prisma }: GraphQLContext) =>
          prisma.memberType.findUnique({
            where: {
              id: id as string,
            },
          }),
      },
      profiles: {
        type: TProfileList,
        resolve: async (_, __, { prisma }) => prisma.profile.findMany(),
      },
      profile: {
        type: TProfile,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_, { id: profileId, ...r }, { prisma }) =>
          prisma.profile.findUnique({
            where: {
              id: profileId as string,
            },
          }),
      },
      users: {
        type: TUserList,
        resolve: async (_, __, { prisma }) =>
          prisma.user.findMany({
            include: {
              posts: true,
              profile: true,
              subscribedToUser: true,
            },
          }),
      },
      user: {
        type: TUser,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_, { id }, { prisma }) =>
          prisma.user.findUnique({
            where: {
              id: id as string,
            },
          }),
      },
      posts: {
        type: TPostList,
        resolve: async (_, __, { prisma }) => prisma.post.findMany(),
      },
      post: {
        type: TPost,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_, { id }, { prisma }) =>
          prisma.post.findUnique({
            where: {
              id: id as string,
            },
          }),
      },
      testString: {
        type: GraphQLString,
        description: 'TestString',
        resolve: () => Math.random().toString(),
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
      createPost: {
        type: new GraphQLObjectType({
          name: 'CreatePost',
          fields: {
            id: {
              type: UUIDType,
            },
          },
        }),
        args: {
          dto: {
            type: new GraphQLNonNull(
              new GraphQLInputObjectType({
                name: 'CreatePostInput',
                fields: {
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
              }),
            ),
          },
        },
        resolve: async (_, { dto }, { prisma }: GraphQLContext) => {
          return prisma.post.create({
            data: dto as Post,
          });
        },
      },
      createProfile: {
        type: new GraphQLObjectType({
          name: 'CreateProfile',
          fields: {
            id: {
              type: UUIDType,
            },
          },
        }),
        args: {
          dto: {
            type: new GraphQLNonNull(
              new GraphQLInputObjectType({
                name: 'CreateProfileInput',
                fields: {
                  isMale: {
                    type: GraphQLBoolean,
                  },
                  yearOfBirth: {
                    type: GraphQLInt,
                  },
                  memberTypeId: {
                    type: EMemberTypeId,
                  },
                  userId: {
                    type: UUIDType,
                  },
                },
              }),
            ),
          },
        },
        resolve: async (_, { dto }, { prisma }: GraphQLContext) => {
          return prisma.profile.create({
            data: dto as Profile,
          });
        },
      },
      createUser: {
        type: new GraphQLObjectType({
          name: 'CreateUser',
          fields: {
            id: {
              type: UUIDType,
            },
          },
        }),
        args: {
          dto: {
            type: new GraphQLNonNull(
              new GraphQLInputObjectType({
                name: 'CreateUserInput',
                fields: {
                  name: {
                    type: GraphQLString,
                  },
                  balance: {
                    type: GraphQLFloat,
                  },
                },
              }),
            ),
          },
        },
        resolve: async (_, { dto }, { prisma }: GraphQLContext) => {
          return prisma.user.create({
            data: dto as User,
          });
        },
      },
      changePost: {
        type: new GraphQLObjectType({
          name: 'ChangePost',
          fields: {
            id: {
              type: UUIDType,
            },
          },
        }),
        args: {
          id: {
            type: UUIDType,
          },
          dto: {
            type: new GraphQLNonNull(
              new GraphQLInputObjectType({
                name: 'ChangePostInput',
                fields: {
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
              }),
            ),
          },
        },
        resolve: async (_, { id: postId, dto }, { prisma }: GraphQLContext) => {
          return prisma.post.update({
            data: dto as Post,
            where: {
              id: postId as string,
            },
          });
        },
      },
      changeProfile: {
        type: new GraphQLObjectType({
          name: 'ChangeProfile',
          fields: {
            id: {
              type: UUIDType,
            },
          },
        }),
        args: {
          id: {
            type: UUIDType,
          },
          dto: {
            type: new GraphQLNonNull(
              new GraphQLInputObjectType({
                name: 'ChangeProfileInput',
                fields: {
                  isMale: {
                    type: GraphQLBoolean,
                  },
                  yearOfBirth: {
                    type: GraphQLInt,
                  },
                  memberTypeId: {
                    type: EMemberTypeId,
                  },
                  userId: {
                    type: UUIDType,
                  },
                },
              }),
            ),
          },
        },
        resolve: async (_, { id: profileId, dto }, { prisma }: GraphQLContext) => {
          return prisma.profile.update({
            data: dto as Profile,
            where: {
              id: profileId as string,
            },
          });
        },
      },
      changeUser: {
        type: new GraphQLObjectType({
          name: 'ChangeUser',
          fields: {
            id: {
              type: UUIDType,
            },
          },
        }),
        args: {
          id: {
            type: UUIDType,
          },
          dto: {
            type: new GraphQLNonNull(
              new GraphQLInputObjectType({
                name: 'ChangeUserInput',
                fields: {
                  name: {
                    type: GraphQLString,
                  },
                  balance: {
                    type: GraphQLFloat,
                  },
                },
              }),
            ),
          },
        },
        resolve: async (_, { id: userId, dto }, { prisma }: GraphQLContext) => {
          return prisma.user.update({
            data: dto as User,
            where: {
              id: userId as string,
            },
          });
        },
      },
      deletePost: {
        type: GraphQLString,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_, { id: postId }, { prisma }: GraphQLContext) => {
          await prisma.post.delete({
            where: {
              id: postId as string,
            },
          });
          return '';
        },
      },
      deleteProfile: {
        type: GraphQLString,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_, { id: profileId }, { prisma }: GraphQLContext) => {
          await prisma.profile.delete({
            where: {
              id: profileId as string,
            },
          });
          return '';
        },
      },
      deleteUser: {
        type: GraphQLString,
        args: {
          id: {
            type: UUIDType,
          },
        },
        resolve: async (_, { id: userId }, { prisma }: GraphQLContext) => {
          await prisma.user.delete({
            where: {
              id: userId as string,
            },
          });
          return '';
        },
      },
      subscribeTo: {
        type: GraphQLString,
        args: {
          userId: {
            type: UUIDType,
          },
          authorId: {
            type: UUIDType,
          },
        },
        resolve: async (_, { userId, authorId }, { prisma }: GraphQLContext) => {
          await prisma.subscribersOnAuthors.create({
            data: {
              subscriberId: userId as string,
              authorId: authorId as string,
            },
          });
          return '';
        },
      },
      unsubscribeFrom: {
        type: GraphQLString,
        args: {
          userId: {
            type: UUIDType,
          },
          authorId: {
            type: UUIDType,
          },
        },
        resolve: async (_, { userId, authorId }, { prisma }: GraphQLContext) => {
          await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId as string,
                authorId: authorId as string,
              },
            },
          });
          return '';
        },
      },
    },
  }),
});
