FROM node:latest

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

COPY apps/api/prisma ./apps/api/prisma/

RUN pnpm install

COPY . .

WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

EXPOSE 8000

CMD [ "sh", "-c", "pnpm prisma migrate deploy && pnpm run seed && pnpm start" ]
