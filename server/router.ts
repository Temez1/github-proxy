import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { request as octo } from "@octokit/request";

export const t = initTRPC.create();

const ListReposForUserParamsSchema = z
  .object({
    type: z.literal("all").or(z.literal("owner")).or(z.literal("member")),
    sort: z
      .literal("created")
      .or(z.literal("updated"))
      .or(z.literal("pushed"))
      .or(z.literal("full_name")),
    direction: z.literal("asc").or(z.literal("desc")),
    per_page: z.number().int(),
    page: z.number().int(),
  })
  .partial();

const SearchUsersEnrichWithSchema = z
  .object({
    listReposParams: ListReposForUserParamsSchema,
  })
  .partial()
  .refine(
    ({ listReposParams }) => listReposParams !== undefined,
    // We can extend this with eg. || listFollowersParams !== undefined
    { message: "One of the fields must be defined" }
  );

const SearchUsersSchema = z.object({
  q: z.string().min(1),
  sort: z
    .literal("followers")
    .or(z.literal("repositories"))
    .or(z.literal("joined"))
    .optional(),
  order: z.literal("desc").or(z.literal("asc")).optional(),
  per_page: z.number().int().optional(),
  page: z.number().int().optional(),
  enrichSearchWith: SearchUsersEnrichWithSchema.optional(),
});

export const appRouter = t.router({
  searchUsers: t.procedure.input(SearchUsersSchema).query(async ({ input }) => {
    const { enrichSearchWith, ...searchUserParams } = input;
    const usersRes = await octo("GET /search/users", { ...searchUserParams });

    if (usersRes.data.total_count === 0) {
      return usersRes;
    }

    if (!enrichSearchWith) {
      return usersRes;
    }

    let usersEnrichedWithRepos = usersRes;

    if (enrichSearchWith.listReposParams) {
      const usersReposRes = await Promise.allSettled(
        usersEnrichedWithRepos.data.items.map(async (user) => {
          const { listReposParams } = enrichSearchWith;
          const userReposRes = await octo("GET /users/{username}/repos", {
            username: user.login,
            sort: listReposParams?.sort || "updated",
            per_page: listReposParams?.per_page || 5,
            ...listReposParams,
          });
          const userReposSimplified = userReposRes.data.map(
            ({ name, full_name, html_url }) => ({ name, full_name, html_url })
          );
          return userReposSimplified;
        })
      );

      usersEnrichedWithRepos.data.items = usersReposRes.map((res, index) => {
        if (res.status === "rejected") {
          const { status, reason } = res;
          return {
            userRepos: { status, reason },
            ...usersRes.data.items[index],
          };
        }
        const { status, value } = res;
        return {
          userRepos: { status, value },
          ...usersRes.data.items[index],
        };
      });
    }

    return usersEnrichedWithRepos;
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
