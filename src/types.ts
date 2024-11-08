import { PrismaClient } from '@prisma/client';
import { Loaders } from './loaders.js';

export type GraphQLContext = {
  prisma: PrismaClient;
  loaders: Loaders;
};
