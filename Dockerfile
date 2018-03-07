FROM node:carbon

# ------------------------
# SSH Server support
# ------------------------
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssh-server lnav \
    && echo "root:Docker!" | chpasswd

COPY sshd_config /etc/ssh/

EXPOSE 2222 80

# Install App
WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

CMD service ssh start && yarn start > process.log