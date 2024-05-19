import sys
import joblib
import os
import urllib.parse
import pika

from loguru import logger
from config import RABBIT_MQ_HOST, WAF_TO_ML_QUEUE, ML_TO_EBPF_QUEUE
from concurrent.futures import ThreadPoolExecutor
from sklearn.feature_extraction.text import TfidfVectorizer
from util import addr_to_ip


def load(name):
    filepath = os.path.join(str(os.getcwd()), name)
    with open(filepath, 'r', encoding="utf-8") as f:
        alldata = f.readlines()
    queries = []
    for i in alldata:
        i = str(urllib.parse.unquote(i))
        queries.append(i)
    return queries


def send_result_to_ebpf(channel, ip_info, y):
    channel.basic_publish(
        exchange='', routing_key=ML_TO_EBPF_QUEUE, body=f'{ip_info}+{y[0]}')


def predict_task(input, channel, vectorizer, model):
    # find the first + char in the input
    input = input.decode().split('+', 1)

    if len(input) != 2:
        return

    addr_info = input[0]
    http_data = input[1]

    logger.info(f'ip_info: {addr_to_ip(addr_info)}, http_data: {http_data}')

    # preidict with the model
    X = vectorizer.transform([http_data])
    y = model.predict(X)

    if y[0] == 1:
        logger.error(f'{addr_to_ip(addr_info)} has a bad query')

    # publish a message thread safing
    channel.connection.add_callback_threadsafe(
        lambda: send_result_to_ebpf(channel, addr_to_ip(addr_info), y))


def main():
    # 加载数据
    goodqueries = load('./data/goodqueries.data')
    badqueries = load('./data/badqueries.data')

    # 创建向量化工具
    vectorizer = TfidfVectorizer()
    vectorizer.fit(goodqueries + badqueries)

    # 加载模型
    model = joblib.load('./model/lr.pkl')

    # 创建线程池
    executor = ThreadPoolExecutor(max_workers=7)

    # 创建 rabbitmq 连接
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBIT_MQ_HOST))
    channel = connection.channel()

    # 创建队列
    channel.queue_declare(queue=WAF_TO_ML_QUEUE)
    channel.queue_declare(queue=ML_TO_EBPF_QUEUE)

    # 定义接收到信息的处理
    channel.basic_consume(queue=WAF_TO_ML_QUEUE,
                          on_message_callback=lambda ch, method, properties, body: executor.submit(predict_task, body, ch, vectorizer, model), auto_ack=True)

    logger.info("ML service is running")
    try:
        channel.start_consuming()
    except pika.exceptions.StreamLostError as e:
        logger.error(e)
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            executor.shutdown()  # 关闭线程池
            channel.stop_consuming()  # 关闭消费者
            sys.exit(0)
        except SystemExit:
            os._exit(0)


if __name__ == '__main__':
    main()
