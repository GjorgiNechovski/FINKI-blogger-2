from kazoo.client import KazooClient
from kazoo.exceptions import NodeExistsError
import json
import os

import socket
from contextlib import closing


def find_free_port():
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]


def connect_to_zookeeper():
    zk = KazooClient(hosts=os.getenv('ZOOKEEPER_HOST', 'localhost') + ':' + os.getenv('ZOOKEEPER_PORT', '2181'))
    zk.start()
    return zk


def register_service(zk):
    service_name = "comment-service"
    node_path = f"/services/{service_name}"

    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)

    port = find_free_port()

    service_data = json.dumps({
        "ip": ip_address,
        "port": port
    }).encode()

    try:
        zk.create(node_path, service_data, ephemeral=True, makepath=True)
    except NodeExistsError:
        zk.set(node_path, service_data)

    print(f"Registered service at {node_path}")
    return port


zk_client = None
service_port = None