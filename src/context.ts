import { PrismaClient } from '@prisma/client';
import { buildDataLoaders } from './data-loaders.js';

export function buildContext(prisma: PrismaClient) {
  const loaders = buildDataLoaders(prisma);

  return {
    prisma,
    loaders,
  };
}
