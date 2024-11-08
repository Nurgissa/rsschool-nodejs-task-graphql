import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { buildContext } from '../../context.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
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

      const context = buildContext(fastify.prisma);

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
        contextValue: context,
      });
    },
  });
};

export default plugin;
