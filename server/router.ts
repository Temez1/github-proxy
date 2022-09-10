import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { request as octo } from "@octokit/request";

export const t = initTRPC.create();

const listReposForUserSchema = z.object({
  type: z
    .literal("all")
    .or(z.literal("owner"))
    .or(z.literal("member"))
    .optional(),
  sort: z
    .literal("created")
    .or(z.literal("updated"))
    .or(z.literal("pushed"))
    .or(z.literal("full_name"))
    .optional(),
  direction: z.literal("asc").or(z.literal("desc")).optional(),
  per_page: z.number().int().optional(),
  page: z.number().int().optional(),
});

const enrichSearchWithSchema = z
  .object({
    listRepos: listReposForUserSchema,
  })
  .partial()
  .refine(
    ({ listRepos }) => listRepos !== undefined,
    // We can extend this with eg. || listFollowers !== undefined
    { message: "One of the fields must be defined" }
  );

const searchUsersSchema = z.object({
  q: z.string(),
  sort: z
    .literal("followers")
    .or(z.literal("repositories"))
    .or(z.literal("joined"))
    .optional(),
  order: z.literal("desc").or(z.literal("asc")).optional(),
  per_page: z.number().int().optional(),
  page: z.number().int().optional(),
  enrichSearchWith: enrichSearchWithSchema,
});

export const appRouter = t.router({
  searchUsers: t.procedure.input(searchUsersSchema).query(async ({ input }) => {
    // Search
  }),
  testUsersSearch: t.procedure
    .input(searchUsersSchema)
    .query(async ({ input }) => {
      const q = "tom+followers:>10000";
      const { enrichSearchWith, ...userParams } = input;
      const usersRes = await octo("GET /search/users", { q });

      if (!enrichSearchWith) {
        return usersRes;
      }

      const usersWithRepos = await Promise.allSettled(
        usersRes.data.items.map(async (user) => {
          const userReposReq = await octo("GET /users/{username}/repos", {
            username: user.login,
            sort: "updated",
            per_page: 5,
          });
          const userReposSimplified = userReposReq.data.map(
            ({ name, full_name, html_url }) => ({ name, full_name, html_url })
          );
          return {
            userRepos: userReposSimplified,
            ...user,
          };
        })
      );

      return usersWithRepos;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
