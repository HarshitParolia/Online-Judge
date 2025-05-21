FROM node:18-alpine
# WORKDIR /compiler

WORKDIR /api
# install gcc
RUN apk update && apk add --no-cache g++ make 
RUN apk add --update build-base && gcc --version && g++ --version && make --version

# install python3
RUN apk add --update python3 && python3 --version

# install redis
# RUN apk add --update redis && redis-server && redis-cli
# RUN apt-get update && apt-get install -y gcc build-essential

# Install php
RUN apk update && apk add --no-cache php &&  php --version

# Install Java
RUN apk update && apk add --no-cache openjdk11 && java --version && javac --version
RUN apk update && apk add --no-cache openjdk11-jdk && java --version && javac --version

# RUN apk add --update openjdk11
# RUN apk add --update openjdk11-jdk

# Install Rust
# RUN apk add --update rust && rustc --version && cargo --version

# Install Ruby
RUN apk add --update ruby && ruby --version

# Install C#
# RUN apk add --update mono

COPY package*.json ./
RUN npm install 
COPY . .

ARG MONGO_URL=""
ARG SUBMISSION_PORT=""
ARG MAX_TIMEOUT=""

ENV MONGO_URL=${MONGO_URL}
ENV SUBMISSION_PORT=${SUBMISSION_PORT}
ENV MAX_TIMEOUT=${MAX_TIMEOUT}

EXPOSE 4500

CMD ["npm", "run", "dev"];
# CMD ["node", "submissionServer.js"]
