FROM mhart/alpine-node:base-0.10

WORKDIR /src
ADD . .

EXPOSE 3000
CMD ["node", "index.js"]
