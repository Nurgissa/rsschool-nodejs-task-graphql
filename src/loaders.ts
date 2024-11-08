import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';
import DataLoader from 'dataloader';

export type Loaders = {
  fetchAllMemberTypes: () => Promise<MemberType[]>;
  fetchMemberTypeById: (memberTypeId: string) => Promise<MemberType | null>;
  fetchAllProfiles: () => Promise<Profile[]>;
  fetchProfileById: (profileId: string) => Promise<Profile | null>;
  fetchAllUsers: () => Promise<User[]>;
  fetchUserById: (userId: string) => Promise<User | null>;
  fetchAllPosts: () => Promise<Post[]>;
  fetchPostById: (postId: string) => Promise<Post | null>;
};

export function getDataLoaders(prisma: PrismaClient): Loaders {
  const userLoader = new DataLoader(async () =>
    prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
        subscribedToUser: true,
      },
    }),
  );

  const userByIdLoader = new DataLoader(async (userIds) => {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds.map((userId) => userId as string),
        },
      },
    });

    const userById = users.reduce<Record<string, User>>((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});

    return userIds.map((userId) => userById[userId as string] || null);
  });

  const subscribersByAuthorLoader = new DataLoader(async (authorIds) => {
    const result = await prisma.subscribersOnAuthors.findMany({
      where: {
        authorId: {
          in: authorIds.map((userId) => userId as string),
        },
      },
      include: {
        author: true,
        subscriber: true,
      },
    });
    return result.map(({ subscriber }) => subscriber);
  });
  /*
    resolve: async ({ id }) => {

  },
     */

  const postLoader = new DataLoader(async (ids) => {
    const set = new Set<Post | null>();
    for await (const postId of ids) {
      const post = await prisma.post.findUnique({
        where: {
          id: postId as string,
        },
      });
      set.add(post);
    }
    return Array.from(set);
  });

  const profileLoader = new DataLoader(async (ids) => {
    const set = new Set<Profile | null>();
    for await (const profileId of ids) {
      const profile = await prisma.profile.findUnique({
        where: {
          id: profileId as string,
        },
        include: {
          memberType: true,
        },
      });
      set.add(profile);
    }
    return Array.from(set);
  });

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
    fetchProfileById: async (profileId: string) => profileLoader.load(profileId),
    fetchAllPosts: async () => prisma.post.findMany({}),
    fetchPostById: async (postId: string) => postLoader.load(postId),
    fetchAllUsers: async () =>
      prisma.user.findMany({
        include: {
          posts: true,
          profile: true,
          subscribedToUser: true,
        },
      }),
    fetchUserById: async (userId: string) => userByIdLoader.load(userId),
  };
}
