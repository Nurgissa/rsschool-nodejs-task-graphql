import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { getDataLoaders } from '../../loaders.js';
import { GraphQLContext } from '../../types.js';

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
      const queryAst = parse(req.body.query);

      const [validationError] = validate(schema, queryAst, [depthLimit(5)]);
      if (validationError) {
        return {
          data: null,
          errors: [validationError],
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
