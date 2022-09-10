import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";

export default {
  port: 3000,
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint: "",
      req: request,
      router: appRouter,
      createContext: () => ({}),
    });
  },
};
