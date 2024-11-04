import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import {
  getAllMemberTypesGQLSchema,
  getMemberTypeByIdGQLSchema,
} from '../member-types/schemas.js';
import { getAllProfilesGQLSchema, getProfileByIdGQLSchema } from '../profiles/schemas.js';
import { getAllUsersGQLSchema, getUserByIdGQLSchema } from '../users/schemas.js';
import { getAllPostsGQLSchema, getPostByIdGQLSchema } from '../posts/schemas.js';

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
        }),
        source: req.body.query,
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;
