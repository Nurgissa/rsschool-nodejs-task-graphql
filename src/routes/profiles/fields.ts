import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLObjectType } from 'graphql';
import { UUIDType } from '../graphql/types/uuid.js';
import { TMemberType } from '../member-types/fields.js';

export const TProfile = new GraphQLObjectType({
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
    memberType: {
      type: TMemberType,
      resolve: async ({ memberTypeId }, _, context) =>
        context.loaders.memberTypeLoader.load(memberTypeId),
    },
  }),
});
export const TProfileList = new GraphQLList(TProfile);
