import type { Skill, User, UserSkill } from '@openpath/db';

type UserWithSkills = User & {
  skills?: (UserSkill & { skill: Skill })[];
};

// Serializes a User for API responses: converts BigInt githubId to a string
// (JSON can't serialize BigInt) and never leaks the stored access token.
export function toUserDto(user: UserWithSkills) {
  return {
    id: user.id,
    githubId: user.githubId.toString(),
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    email: user.email,
    experienceLevel: user.experienceLevel,
    interests: user.interests,
    skills: user.skills?.map((us) => ({
      name: us.skill.name,
      type: us.skill.type,
      source: us.source,
      weight: us.weight,
    })),
    createdAt: user.createdAt,
  };
}
