#!/usr/bin/env python
import socket
import argparse
from utils import send_msg, recv_msg


parser = argparse.ArgumentParser()
parser.add_argument('--verbose', '-v', help='verbose', type=bool, default=False)
parser.add_argument('--terminate', help='terminate server', type=bool, default=False)
args = parser.parse_args()

if args.terminate:
    data = 'killsrv'
else:
    data = '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": "1234"}'
    # data = '{"1": 10, "2": 30, "3": 60, "4": 80, "5": 90, "6": 0, "7": 1, "8": 0}'

PORT = 9999


with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect(("localhost", PORT))
    send_msg(s, data.encode('utf-8'))
    if args.verbose:
        print('Sent data', data)
    data = recv_msg(s)
    if args.verbose:
        print('Received', repr(data))
