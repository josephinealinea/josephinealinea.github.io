---
layout: post
title: "[K8s] Using Helm for deployment of your first container application"
date: 2020-11-24 14:00:00 +0000
categories: [Software Engineering]
tags: [containerization, devops, docker, k8s, kubernetes]
---

As we had previously run the image as a containerized application in my previous post, let's move forward into deployment orchestration using the widely known **Kubernetes**. Alongside, we will use Helm.

Kubernetes, a.k.a. K8s, is an open-source system for automating deployment, scaling, and management of containerized applications. It was developed, designed, and used initially by Google before it has been open-sourced to the public. _(More info here ->_ https://www.redhat.com/en/topics/containers/what-is-kubernetes)

## So what is Helm anyway?

Helm is a package manager for Kubernetes. It helps you create the manifest files for your K8s resources. It can help you manage K8s applications, define, install, and upgrade with ease. Helm uses charts as a packaged application, in which you can version and deploy as another set of configurations. (It doesn't stop there and you can find more info here -> https://helm.sh/)

## Prerequisites

- ✔ A Kubernetes cluster and CLI
- ✔ Helm
- ✔ Docker repository

For this post, we will use **Minikube** as a single node K8s cluster.   
Get information on how to install here -> https://minikube.sigs.k8s.io/docs/start/

For Helm installation -> https://helm.sh/docs/intro/install/

For Mac 🍏 users, you can install them easily via Homebrew. 

❌ **Note:** This post doesn't cover tutorials for basic commands and installations

```bash
brew install minikube
brew install kubectl
brew install helm
```

If you don't have a docker repository, you can create a free account in Docker Hub -> https://hub.docker.com/

## What a nice brew, let's get it all started!

### 1) Create our Helm Charts

As mentioned earlier, Helm uses charts as a packaged application to be used per deployment. You can download available stable charts from the Helm repository, or create your own. For this post, we will create our own chart and it is easily done by:

```bash
helm create helloworld-helm
```

This will create a whole packaged helm application from where you have executed the command.

**Before we proceed with the installation of the Helm chart,** let's inspect the created files and modify them according to our deployment.

- **Chart.yaml** file is the main configuration file for the application. From here, you can find the release details and version. Let's modify the 'appVersion' to our image or application "tag" version in our docker repository.

- **values.yaml** is where you put all the variables definition you can use in the template folder. Let's modify the image repository and the port we will port forward to be available for our test. 

- Inside the **template** folder, you will find K8s manifest resource file (deployment, service, etc). 

**Note**: For this tutorial, we will not cover detailed information for each K8s object. We just need to make sure that the 'deployment' object is pointing to the correct image repository and is using the correct value in the containerPort attribute.

There's a lot to read about the K8s objects. Please read official documentation more info   
- Helm documentation -> https://helm.sh/docs/  
- K8s objects -> https://kubernetes.io/docs/home/

### 2) Install (or deploy) Helm Charts

Now that we have it all-ready, let's install our Helm chart.

For verification, let's check the list of charts installed and Kubernetes resources available

```bash
helm ls
kubectl get deployments
```

To install chart:

```bash
helm install [name of release] [path of helm chart application]
helm install helloworld-demo ./helloworld-helm
```

Verify the deployed chart by running

```bash
helm ls
kubectl get deployments
```

### 3) Port forwarding of the containerized application

As the last step, we need to have the port exposed so that we can use it in the browser or via 'curl' command. Let's see if the application is already running:

```bash
curl localhost:8080
```

In order to get the application running, let's forward the port of the containerized application. It is simply 

```bash
kubectl --namespace [namespace name] port-forward [pod name] [port forward container port]
```

You may wonder, how to get the pod name. Do so by executing below:

```bash
kubectl get pods
```

Let's port-forward: 

And to verify if it's running:

```bash
curl localhost:8080
```

Two things here. 

We get the response from the 'curl' command, and the terminal when we did the port-forwarding displays information that a connection was established.

**Congratulations!** We just have finished our first Helm deployment.

More advanced commands and K8s resource files should be handled on another topic (as it is a lot).

Again, I'd suggest you read more on the official Helm and Kubernetes documentation.

Happy Helming! 👲