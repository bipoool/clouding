# Build stage
FROM golang:1.23.4 AS builder

WORKDIR /app

# copy go.mod and go.sum first for caching
COPY go.mod go.sum ./
RUN go mod download

# copy the source code
COPY . .

# build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o app .

# Final stage using distroless
FROM gcr.io/distroless/static-debian12

# copy the binary
COPY --from=builder /app/app /app

# no shell, no package manager, distroless style
ENTRYPOINT ["/app"]
