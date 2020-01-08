import socket
import argparse
import json

parser = argparse.ArgumentParser(
    description="Allows user to navigate through latent space with user input received as json")
parser.add_argument('-p', '--port', nargs='?', type=int, default='9999')
parser.add_argument('--host', nargs='?', default='localhost')

args = parser.parse_args()

PORT = args.port
HOST = args.host

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    while True:
      conn, addr = s.accept()
      try:
        data = conn.recv(5000)
        print("raw", data)
        if not data:
            break
        elif data == 'killsrv':
          conn.close()
          sys.exit()
        else:
          try:
            parsed_json = json.loads(data)
            print("parsed", parsed_json)
          except ValueError:
            print("json parsing error")
          out_dict = {'status': 'okay', 'file': 'custom-map.png'}
          out_json = json.dumps(out_dict)
          conn.sendall(out_json.encode('utf-8'))
      except KeyboardInterrupt:
        conn.close()
        sys.exit()