import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  parse,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  validate,
} from 'graphql';
import depthLimit from 'graphql-depth-limit';

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
      const queryAst = parse(req.body.query);
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'RootQuery',
          fields: {
            memberTypes: {
              type: TMemberTypeList,
              resolve: async (_, __, { loaders }: GraphQLContext) =>
                loaders.fetchAllMemberTypes(),
            },
            memberType: {
              type: TMemberType,
              args: {
                id: {
                  type: EMemberTypeId,
                },
              },
              resolve: async (_, { id }, { loaders }: GraphQLContext) =>
                loaders.fetchMemberTypeById(id),
            },
            profiles: {
              type: TProfileList,
              resolve: async (_, __, { loaders }) => loaders.fetchAllProfiles(),
            },
            profile: {
              type: TProfile,
              args: {
                id: {
                  type: UUIDType,
                },
              },
              resolve: async (_, { id: profileId }, { loaders }) =>
                loaders.fetchProfileById(profileId),
            },
            users: {
              type: TUserList,
              resolve: async (_, __, { loaders }) => loaders.fetchAllUsers(),
            },
            user: {
              type: TUser,
              args: {
                id: {
                  type: UUIDType,
                },
              },
              resolve: async (_, { id }, { loaders }) => loaders.fetchUserById(id),
            },
            posts: {
              type: TPostList,
              resolve: async (_, __, { loaders }) => loaders.fetchAllPosts(),
            },
            post: {
              type: TPost,
              args: {
                id: {
                  type: UUIDType,
                },
              },
              resolve: async (_, { id }, { loaders }) => loaders.fetchPostById(id),
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
      });
      const [validationError] = validate(schema, queryAst, [depthLimit(5)]);
      if (validationError) {
        return {
          data: null,
          errors: [validationError],
        };
      }

      type Loaders = {
        fetchAllMemberTypes: () => Promise<MemberType[]>;
        fetchMemberTypeById: (memberTypeId: string) => Promise<MemberType | null>;
        fetchAllProfiles: () => Promise<Profile[]>;
        fetchProfileById: (profileId: string) => Promise<Profile | null>;
        fetchAllUsers: () => Promise<User[]>;
        fetchUserById: (userId: string) => Promise<User | null>;
        fetchAllPosts: () => Promise<Post[]>;
        fetchPostById: (postId: string) => Promise<Post | null>;
      };

      type GraphQLContext = {
        prisma: PrismaClient;
        loaders: Loaders;
      };

      function getDataLoaders(prisma: PrismaClient): Loaders {
        return {
          fetchAllMemberTypes: async () => prisma.memberType.findMany(),
          fetchMemberTypeById: async (memberTypeId: string) =>
            prisma.memberType.findUnique({
              where: {
                id: memberTypeId,
              },
            }),
          fetchAllProfiles: async () =>
            prisma.profile.findMany({
              include: {
                memberType: true,
              },
            }),
          fetchProfileById: async (profileId: string) =>
            prisma.profile.findUnique({
              where: {
                id: profileId,
              },
              include: {
                memberType: true,
              },
            }),
          fetchAllPosts: async () => prisma.post.findMany({}),
          fetchPostById: async (postId: string) =>
            prisma.post.findUnique({
              where: {
                id: postId as string,
              },
            }),
          fetchAllUsers: async () =>
            prisma.user.findMany({
              include: {
                posts: true,
                profile: true,
                subscribedToUser: true,
              },
            }),
          fetchUserById: async (userId: string) =>
            prisma.user.findUnique({
              where: {
                id: userId as string,
              },
              include: {
                posts: true,
                profile: true,
                subscribedToUser: true,
              },
            }),
        };
      }

      return graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: {
          prisma,
          loaders: getDataLoaders(prisma),
        } as GraphQLContext,
      });
    },
  });
};

export default plugin;
