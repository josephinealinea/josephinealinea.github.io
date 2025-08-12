---
layout: post
title: "[KAFKA] Simple Publish & Subscribe with Kafka"
date: 2022-02-28 10:00:00 +0000
categories: [Software Engineering]
tags: [kafka]
---

Apache Kafka is an open-source library used for streaming high-volume data in a fast, scalable, and fault-tolerant messaging system. It was originated at LinkedIn before it became an open-source Apache project. (For more reference: https://kafka.apache.org/)

## Where can we use Kafka?

Kafka can be used in many use cases and it is popular for handling big chunks of data. It can be used for log aggregation, monitoring metrics, and stream processing such as integration with Stork and Spark.

## Messaging system introduction: _Publish & Subscribe_

The diagram above is a very high-level explanation of what a Publish-Subscribe messaging is. The Sender / Publisher sends a message to the message queue and all nodes that are subscribed to the message queue should and would be able to read and consume the message residing in that queue.

## Kafka Components

Before we move any further, we should know what are the Kafka components. Scroll fast below if you already know the Kafka components.

1. **Producer** -> this is the publisher of the message into the Kafka topic. Producer sends the message to Kafka broker. The Producer's only role is to publish the data without waiting for acknowledgement.
2. **Consumer** -> this is the consumer that reads the message. Typically, the consumer must be subscribed in order to pull the message from the Kafka broker. The consumer then sends an acknowledgement by updating the offset.
3. **Broker** -> this is the system responsible for maintaining the published data. Keep in mind that broker is stateless, and states are maintained by the Zookeeper.  
   When a broker is more than one, it is called a **Kafka Cluster.** A cluster has Leader and follower(s), which are elected by the Zookeeper.
4. **Topic** -> data is stored in topics, and a topic is a stream of messages belonging to the same category. A topic has one or more partitions and each partition is in ordered sequence. The unique id of a partition is called an **offset**.
5. **Replica** -> replica(s) is/are nothing but just "backups" of a partition. The main and only purpose is the prevention of data loss.
6. **Zookeeper** -> this is one that manages and coordinates the brokers. It notifies the producers and consumers of the presence of new or failure of brokers in the Kafka system. It is also the one that elects the broker leader.

## In a nutshell…

Let's get started.

**Note**: Commands are for Mac 🍏 users using Homebrew.

## Pre-requisite

You should have the below installed on your machine. You can install them using Homebrew commands below:

- ✔ JDK
```bash
brew install openjdk@8
```

- ✔ Zookeeper
```bash
brew install zookeeper
```

- ✔ Kafka
```bash
brew install kafka
```

## Setting up the Kafka cluster

### 1. Start the Zookeeper
Zookeeper must be started first before starting Kafka broker

```bash
brew services start zookeeper
```

### 2. Start the Kafka broker

```bash
brew services start kafka
```

### 3. Create Kafka topic

```bash
kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic test
```

### 4. View Kafka topic

```bash
kafka-topics --list --bootstrap-server localhost:9092
```

### 5. Publish a message to a topic
Add any message after clicking enter

```bash
kafka-console-producer --broker-list localhost:9092 --topic test
```

### 6. Consume a message
Preferably execute this command on another terminal

```bash
kafka-console-consumer --bootstrap-server localhost:9092 --topic test --from-beginning
```

This is how it looks like in my demo:

And to stop both services:

```bash
brew services stop kafka
brew services stop zookeeper
```

Hope you enjoyed a very short introduction and demo of Kafka Publish & Subscribed ��