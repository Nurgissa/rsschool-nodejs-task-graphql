import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { Post, Profile, User } from '@prisma/client';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
} from 'graphql/index.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const EMemberTypeId = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
      BASIC: { value: 'BASIC' },
      BUSINESS: { value: 'BUSINESS' },
    },
  });

  const TMemberType = new GraphQLObjectType({
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
  const TMemberTypeList = new GraphQLList(TMemberType);

  const TPost = new GraphQLObjectType({
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
  const TPostList = new GraphQLList(TPost);

  // const IUser = new GraphQLInterfaceType({
  //   name: 'IUser',
  //   fields: () => ({
  //     id: {
  //       type: GraphQLString,
  //     },
  //     name: {
  //       type: GraphQLString,
  //     },
  //     balance: {
  //       type: GraphQLFloat,
  //     },
  //     subscribedToUser: {
  //       type: new GraphQLList(IUser), // Using a function avoids premature access
  //     },
  //     userSubscribedTo: {
  //       type: new GraphQLList(IUser), // Using a function avoids premature access
  //     },
  //   }),
  // });

  const TProfile = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
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
      user: {
        type: TUser,
      },
      memberTypeId: {
        type: EMemberTypeId,
      },
      memberType: {
        type: TMemberType,
        resolve: async ({ memberTypeId }) => ({
          id: memberTypeId as string,
        }),
      },
    }),
  });
  const TProfileList = new GraphQLList(TProfile);

  const TUser = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: {
        type: GraphQLString,
      },
      name: {
        type: GraphQLString,
      },
      balance: {
        type: GraphQLFloat,
      },
      posts: {
        type: TPostList,
      },
      profile: {
        type: TProfile,
      },
      subscribedToUser: {
        type: new GraphQLList(TUser),
        resolve: async ({ id }) => {
          const result = await prisma.subscribersOnAuthors.findMany({
            where: {
              authorId: id as string,
            },
            include: {
              author: true,
              subscriber: true,
            },
          });
          return result.map(({ subscriber }) => subscriber);
        },
      },
      userSubscribedTo: {
        type: new GraphQLList(TUser),
        resolve: async ({ id }) => {
          const result = await prisma.subscribersOnAuthors.findMany({
            where: {
              subscriberId: id as string,
            },
            include: {
              author: true,
              subscriber: true,
            },
          });
          return result.map(({ author }) => author);
        },
      },
    }),
  });

  const TUserList = new GraphQLList(TUser);

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
              memberTypes: {
                type: TMemberTypeList,
                resolve: async () => prisma.memberType.findMany(),
              },
              memberType: {
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
              },
              profiles: {
                type: TProfileList,
                resolve: async () =>
                  prisma.profile.findMany({
                    include: {
                      memberType: true,
                    },
                  }),
              },
              profile: {
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
                      include: {
                        memberType: true,
                      },
                    });
                  } catch {
                    return Promise.resolve(null);
                  }
                },
              },
              users: {
                type: TUserList,
                resolve: async () =>
                  prisma.user.findMany({
                    include: {
                      posts: true,
                      profile: true,
                      subscribedToUser: true,
                      // userSubscribedToUser: true,
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
                resolve: async (_, { id: userId }) => {
                  try {
                    return prisma.user.findUnique({
                      where: {
                        id: userId as string,
                      },
                      include: {
                        posts: true,
                        profile: true,
                        subscribedToUser: true,
                        // userSubscribedToUser: true,
                      },
                    });
                  } catch {
                    return Promise.resolve(null);
                  }
                },
              },
              posts: {
                type: TPostList,
                resolve: async () => prisma.post.findMany({}),
              },
              post: {
                type: TPost,
                args: {
                  id: {
                    type: UUIDType,
                  },
                },
                resolve: async (_, { id: postId }) => {
                  try {
                    return prisma.post.findUnique({
                      where: {
                        id: postId as string,
                      },
                    });
                  } catch (e) {
                    return Promise.resolve(null);
                  }
                },
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
        contextValue: {
          z: 1,
          x: 2,
        },
      });
    },
  });
};

export default plugin;
