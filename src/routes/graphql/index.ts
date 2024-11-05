import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, EMemberTypeId, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import {
  getAllMemberTypesGQLSchema,
  getMemberTypeByIdGQLSchema,
} from '../member-types/schemas.js';
import { getAllProfilesGQLSchema, getProfileByIdGQLSchema } from '../profiles/schemas.js';
import { getAllUsersGQLSchema, getUserByIdGQLSchema } from '../users/schemas.js';
import { getAllPostsGQLSchema, getPostByIdGQLSchema } from '../posts/schemas.js';
import { UUIDType } from './types/uuid.js';
import { Post, Profile, User } from '@prisma/client';
import { GraphQLBoolean, GraphQLFloat, GraphQLInt } from 'graphql/index.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      return graphql({
        schema: new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'RootQuery',
            fields: {
              memberTypes: getAllMemberTypesGQLSchema(prisma),
              memberType: getMemberTypeByIdGQLSchema(prisma),
              profiles: getAllProfilesGQLSchema(prisma),
              profile: getProfileByIdGQLSchema(prisma),
              users: getAllUsersGQLSchema(prisma),
              user: getUserByIdGQLSchema(prisma),
              posts: getAllPostsGQLSchema(prisma),
              post: getPostByIdGQLSchema(prisma),
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
                resolve: async (_, { dto }) => {
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
                resolve: async (_, { dto }) => {
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
                resolve: async (_, { dto }) => {
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
                resolve: async (_, { id: postId, dto }) => {
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
                resolve: async (_, { id: profileId, dto }) => {
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
                resolve: async (_, { id: userId, dto }) => {
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
                resolve: async (_, { id: postId }) => {
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
                resolve: async (_, { id: profileId }) => {
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
                resolve: async (_, { id: userId }) => {
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
                resolve: async (_, { userId, authorId }) => {
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
                resolve: async (_, { userId, authorId }) => {
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
        }),
        source: req.body.query,
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;
