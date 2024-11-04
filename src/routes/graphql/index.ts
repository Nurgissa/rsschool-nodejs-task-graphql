import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import {
  getAllMemberTypesGQLSchema,
  getMemberTypeByIdGQLSchema,
} from '../member-types/schemas.js';

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
              testString: {
                type: GraphQLString,
                description: 'TestString',
                resolve: () => 'testString1',
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
