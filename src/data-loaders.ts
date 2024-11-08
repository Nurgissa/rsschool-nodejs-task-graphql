import DataLoader from 'dataloader';
import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';

export function buildDataLoaders(prisma: PrismaClient) {
  return {
    memberTypeLoader: new DataLoader(async (ids: readonly string[]) => {
      const memberTypes = await prisma.memberType.findMany({
        where: { id: { in: ids.map((id) => id) } },
      });
      const memberTypeById = memberTypes.reduce<Record<string, MemberType>>(
        (acc, cur) => {
          acc[cur.id] = cur;
          return acc;
        },
        {},
      );
      return ids.map((id) => memberTypeById[id]);
    }),
    postsByIdLoader: new DataLoader(async (ids: readonly string[]) => {
      const posts = await prisma.post.findMany({
        where: { id: { in: ids.map((id) => id) } },
      });
      const postById = posts.reduce<Record<string, Post>>((acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      }, {});
      return ids.map((id) => postById[id]);
    }),
    userByIdLoader: new DataLoader(async (ids: readonly string[]) => {
      const users = await prisma.user.findMany({
        where: { id: { in: ids.map((id) => id) } },
      });
      const userById = users.reduce<Record<string, User>>((acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      }, {});
      return ids.map((id) => userById[id]);
    }),

    profileByUserIdLoader: new DataLoader(async (userIds: readonly string[]) => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: userIds.map((id) => id) } },
      });

      const profileByUserId = profiles.reduce<Record<string, Profile>>((acc, cur) => {
        acc[cur.userId] = cur;
        return acc;
      }, {});

      return userIds.map((id) => profileByUserId[id] || null);
    }),
    postsByAuthorIdLoader: new DataLoader(async (authorIds: readonly string[]) => {
      const posts = await prisma.post.findMany({
        where: {
          authorId: {
            in: authorIds.map((id) => id),
          },
        },
      });

      const postByAuthorId = posts.reduce<Record<string, Post[]>>((acc, cur) => {
        if (acc[cur.authorId]) {
          acc[cur.authorId].push(cur);
        } else {
          acc[cur.authorId] = [cur];
        }
        return acc;
      }, {});
      return authorIds.map((id) => postByAuthorId[id] || null);
    }),
    userSubscribedToLoader: new DataLoader(async (userIds: readonly string[]) => {
      const subscribers = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: { in: userIds.map((id) => id) } },
        include: { author: true },
      });

      const authorsBySubscriberId = subscribers.reduce<Record<string, User[]>>(
        (acc, cur) => {
          if (acc[cur.subscriberId]) {
            acc[cur.subscriberId].push(cur.author);
          } else {
            acc[cur.subscriberId] = [cur.author];
          }
          return acc;
        },
        {},
      );

      return userIds.map((userId) => authorsBySubscriberId[userId] || []);
    }),
    subscribedToUserLoader: new DataLoader(async (userIds: readonly string[]) => {
      const authors = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: { in: userIds.map((id) => id) } },
        include: { subscriber: true },
      });
      const subscribersByAuthorId = authors.reduce<Record<string, User[]>>((acc, cur) => {
        if (acc[cur.authorId]) {
          acc[cur.authorId].push(cur.subscriber);
        } else {
          acc[cur.authorId] = [cur.subscriber];
        }
        return acc;
      }, {});

      return userIds.map((userId) => subscribersByAuthorId[userId] || []);
    }),
  };
}
