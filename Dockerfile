FROM jarredsumner/bun:edge
WORKDIR /app
RUN addgroup bun && adduser -S -H bun -G bun
COPY --chown=bun:bun . .
RUN bun install --production
USER bun
ENTRYPOINT ["bun", "server/index.ts"]