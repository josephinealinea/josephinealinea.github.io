---
layout: post
title: "[DOCKER] Creating and Running your first container application"
date: 2020-11-24 12:00:00 +0000
categories: [Software Engineering]
tags: [containerization, devops, docker]
---

I recently started reading about the "Containerization" of applications using docker. 

In order to try it out for me we are going to cover here some docker commands, starting from the build, pull/push, run, delete, load, etc…

## Prerequisites

I have created a very simple Springboot application which is packaged in a jar.

I have also created a free account in DockerHub (https://hub.docker.com/) as my docker registry.

I also assumed you have the below basics:

- ✔ Maven (or use a Maven Wrapper)
- ✔ Docker

## Let's get into business!

### 1) Package your application using maven

```bash
mvn clean install package
```

This will create a jar under your '/target' project directory

Test your packaged application if to make sure it starts well

- Run my demo jar
```bash
java -jar /target/demo-0.0.1-SNAPSHOT.jar
```

- Check if it started using the 'curl' command
```bash
curl localhost:8080
```

### 2) Create your Dockerfile

A **dockerfile** is a text document containing all the commands needed to create your container image.

Use 'touch' command to create a blank file
```bash
touch Dockerfile
```

Add the below commands in your Dockerfile:

```dockerfile
FROM openjdk:8-alpine
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

The above commands instructs:

- To use the open jdk8 alpine as a base image
- Use ARG command to set the jar file name
- Copy the jar and rename to app.jar
- Set the entry point to start your application

### 3) Now we're ready to build the image!

We will build our image with the name 'helloworld-docker-app' from our project root directory

```bash
docker build -t helloworld-docker-app .
```

To see the images you've created:
```bash
docker images
```

### 4) Push the image to docker registry

Prerequisite:

- Login to docker registry by
```bash
docker login
```

- (For free dockerhub account) Tag the image with your docker user id.
Note: You can use 'tag' or '-t'
```bash
docker tag [image name] [new image name]
docker tag helloworld-docker-app maiajosipin/helloworld-docker-app
```

Push!
```bash
docker push maiajosipin/helloworld-docker-app
```

Here's the uploaded image from dockerhub.

### 5) Let's try to run our image

Since we already have our image in our local workspace, we will not pull from docker registry, but you can do so by executing
```bash
docker pull maiajosipin/helloworld-docker-app
```

To run our app, set the port to 8080:
```bash
docker run helloworld-docker-app -p 8080:8080
```

Test using 'curl' command we also used earlier:
```bash
curl localhost:8080
```

And we're done! 🙂

### 6) Additionally, you can delete the image from your local

```bash
docker rmi [image name]
docker rmi helloworld-docker-app
```

Verify using:
```bash
docker images
```

Happy docker! ��