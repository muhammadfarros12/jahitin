FROM node:latest

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/ui/package.json ./packages/ui/

# 3. Install dependencies (pnpm akan membuat symlink otomatis)
RUN pnpm install --frozen-lockfile

COPY . .

# 5. PENTING: Build package UI terlebih dahulu!
# Agar folder 'dist' atau output di @jahitin/ui tercipta
RUN pnpm --filter @jahitin/ui build

WORKDIR /app/apps/admin
RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "preview", "--port", "3000", "--host" ]
