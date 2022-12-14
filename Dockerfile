FROM jarredsumner/bun:0.1.10
WORKDIR /app
RUN addgroup bun && adduser -S -H bun -G bun
COPY --chown=bun:bun . .
RUN bun install --production
EXPOSE 3000
USER bun
ENTRYPOINT ["bun", "server/index.ts"]