# GitHub Proxy

The project is hosted at <https://github-proxy.fly.dev/>

## This project uses

- [Bun](https://bun.sh), a new blazingly fast all-in-one JS runtime
- [tRPC](https://trpc.io/), for building typesafe APIs that stay in sync with the front-end by sharing types directly between client and server
- [Zod](https://zod.dev/), for query params validation
- [Octokit Request.js](https://github.com/octokit/request.js#readme), for interacting with GitHub API
- [Docker](https://www.docker.com/)

## Query Syntax

The endpoint is /searchUsers and allows query params in the form

```
?input=INPUT
```

where INPUT is a URI-encoded JSON string. The INPUT format can be found from the router SearchUsersSchema

Example search enriched with last 5 updated repos each user owns [tom+followers:>10000](https://github-proxy.fly.dev/searchUsers?input=%7B%22q%22%3A%22tom%2Bfollowers%3A%3E8000%22%2C%20%22enrichSearchWith%22%3A%7B%22listReposParams%22%3A%7B%7D%7D%7D)

## Q&A

● What do you like about your solution?

I like that it's simple and you can extend the search easily with other information about users eg. followers.

● What do you dislike about your solution?

I dislike it misses testing and the dev server doesn't work.

● If you had a full additional day to work on this, what would you improve?

I would refactor some parts of it to its own functions and add testing. The rest of the improvements depends on the business requirements.

● If you would start from scratch now, what would you do differently?

I tested a brand new tech stack and the development experience wasn't the greatest. I would have fixed that by adding a dev server at the beginning of the project.

## To run locally

With docker

```bash
docker compose up
```

With bun


```bash
bun install
bun server/index.ts
```
