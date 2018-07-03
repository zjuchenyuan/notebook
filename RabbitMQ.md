# RabbitMQ 消息队列

## Docker部署

* 必须设置主机名 --hostname
* 数据卷映射
* 使用macvlan分配IP
* 配置用户密码

配置用户密码必须要求数据文件夹为空，否则不会生效

```
rm -rf /docker/rabbitmq/

docker run -d --hostname rabbit --name rmq -v /docker/rabbitmq/:/var/lib/rabbitmq --network macvlan_bridge --ip 192.168.1.18 --dns 192.168.1.1 -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=password rabbitmq
```

## 消费者竞争的任务推送执行

例如发送参数1,2到消费者执行`add(a,b)`函数，每个消费者最多接受一个任务

### config.py 配置信息

与上述docker启动时配置的一致
```
RMQ_HOST = "192.168.1.18"
RMQ_PORT = 5672
RMQ_USER = "user"
RMQ_PASSWORD = "password"
```

### task.py 发送任务

```
#!/usr/bin/env python
import pika
import sys
import json
from config import RMQ_HOST,RMQ_PORT,RMQ_USER,RMQ_PASSWORD
QUEUE_NAME = 'add_task_queue'

params = pika.ConnectionParameters(
        host=RMQ_HOST, 
        port=RMQ_PORT, 
        credentials=pika.credentials.PlainCredentials(RMQ_USER, RMQ_PASSWORD)
    )
connection = pika.BlockingConnection(params)
channel = connection.channel()

channel.queue_declare(queue=QUEUE_NAME, durable=True)

def queue_put(func_args): 
    #func_args:函数参数list
    message = json.dumps(func_args)
    return channel.basic_publish(exchange='',
                          routing_key=QUEUE_NAME,
                          body=message,
                          properties=pika.BasicProperties(
                             delivery_mode = 2, # make message persistent
                          ))

if __name__ == '__main__':
    queue_put([1,2])
    connection.close()
```

### 查看队列状态

查看队列名称 准备发送的数量 没有ack的数量

```
docker exec rmq rabbitmqctl list_queues name messages_ready messages_unacknowledged
```

### worker.py 执行任务

```
#!/usr/bin/env python
import pika
import time
import json
from config import RMQ_HOST,RMQ_PORT,RMQ_USER,RMQ_PASSWORD
QUEUE_NAME = 'add_task_queue'

params = pika.ConnectionParameters(
        host=RMQ_HOST, 
        port=RMQ_PORT, 
        credentials=pika.credentials.PlainCredentials(RMQ_USER, RMQ_PASSWORD)
    )
connection = pika.BlockingConnection(params)
channel = connection.channel()

channel.queue_declare(queue=QUEUE_NAME, durable=True)
print(' [*] Waiting for messages. To exit press CTRL+C')

def add(a, b):
    return a+b

def save_result(args, result):
    print("save_result for", args, ":", result)
    pass # using mysql or whatever storage...

def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    args = json.loads(body.decode())
    result = add(*args)
    save_result(args, result)
    print(" [x] Done")
    ch.basic_ack(delivery_tag = method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(callback,
                      queue=QUEUE_NAME)

channel.start_consuming()
```

代码来自官方教程：https://www.rabbitmq.com/tutorials/tutorial-two-python.html