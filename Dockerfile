FROM mhart/alpine-node:10.15.3 as builder

COPY . /src/
WORKDIR /src
RUN ["npm", "install"]

FROM mhart/alpine-node:base-10.15.3

RUN apk add --update bash && rm -rf /var/cache/apk/*

WORKDIR /app
COPY --from=builder /src/ .
#ADD ["node_modules/", "./node_modules"]
#ADD ["index.js", "package.json", "LICENSE", "./"]

EXPOSE 8080

# bash + trap allows ^C interruption during 'docker run -it'
ENTRYPOINT ["/bin/bash", "-c", "trap 'echo Interrupt Signal Received' INT; $@", "--"]
CMD ["bin/www"]
