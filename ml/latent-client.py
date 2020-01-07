#!/usr/bin/env python
import socket

PORT = 9999

data = '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": "1234"}'
# data = '{"1": 10, "2": 30, "3": 60, "4": 80, "5": 90, "6": 0, "7": 1, "8": 0}'


with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect(("localhost", PORT))
    data = '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": "1234"}'
    s.sendall(data.encode('utf-8'))
    # print('Sent data', data)
    data = s.recv(5000)
    # print('Received', repr(data))
