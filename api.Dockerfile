FROM node:bullseye AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM rust:latest AS runtime
WORKDIR /app
COPY . .
COPY --from=builder /app/public /app/public
RUN cargo build --release
CMD ["./target/release/poll"]