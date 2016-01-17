FROM mhart/alpine-node:base-5.4.1

RUN apk add --update bash && rm -rf /var/cache/apk/*

WORKDIR /app
ADD . .
#ADD ["node_modules/", "./node_modules"]
#ADD ["index.js", "package.json", "LICENSE", "./"]

EXPOSE 8080

# bash + trap allows ^C interruption during 'docker run -it'
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["trap 'echo Interrupt Signal Received' INT; ./bin/www"]
