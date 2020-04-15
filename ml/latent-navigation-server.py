#!/usr/bin/env python
import os
import pickle
import dnnlib.tflib as tflib
import numpy as np
import argparse
import json
import os.path
from PIL import Image
from numpy import load
from numpy import save
import socket
import sys
from utils import recv_msg, send_msg

parser = argparse.ArgumentParser(
    description="Allows user to navigate through latent space with user input received as json")
parser.add_argument('-p', '--port', nargs='?', type=int, default='9999')
parser.add_argument( '--host', nargs='?', default='localhost')
parser.add_argument('-v', '--verbose', type=bool, default=False)

args = parser.parse_args()

PORT = args.port
HOST = args.host
VERBOSE = args.verbose

tflib.init_tf()
with open("maps-model/network-snapshot-011760.pkl", "rb") as f:
    _G, _D, Gs = pickle.load(f)


# navigation in latent space in 6 specific dimensions through vector calculations
def latent_navigation(data):
    # check if the data received can be loaded with json
    try:
        user_input = data
        input_str = str(user_input)
        input_json = json.loads(user_input)
        values = np.fromiter(input_json.values(), dtype=int)
    except ValueError:
        print('Decoding JSON has failed')
    else:
        # check if latent.npy file (where we keep the latent vector)exists, if not create one
        if os.path.exists('latent.npy'):
            latent = load('latent.npy')
        else:
            latent = np.random.standard_normal((1, 512))
            save('latent.npy', latent)

        # first check if the user pressed on button "random map", if yes save a new latent vector to latent.npy
        if values[6] == 1:
            latent = np.random.standard_normal((1, 512))
            save('latent.npy', latent)

        # mapping 0-1023 interval to 200 steps of calculation
        power_1 = values[0] // 5
        power_2 = values[1] // 5
        # for range to calculate factors of dim3 and dim4
        interval_3 = values[2] // 5 + 1
        interval_4 = values[3] // 5 + 1
        power_5 = values[4] // 5
        power_6 = values[5] // 5

        # simplification of calculations in each dimension
        # if input is 0 then power is also 0 -> latent vector does not change despite calculations,
        #  else it changes accordingly
        dim_1 = 0.9 ** power_1
        dim_2 = 1.02 ** power_2

        # factor for summation
        def factor(x):
            y = 0.0005 * x
            return y

        dim_3 = np.sum(list(map(factor, range(0, interval_3))))
        vector_3 = np.full_like(latent, dim_3)
        dim_4 = np.sum(list(map(factor, range(0, interval_4))))
        vector_4 = np.full_like(latent, dim_4)
        dim_5 = 0.93 ** power_5
        dim_6 = 1.02 ** power_6

        # first dimension
        latent = latent * dim_1

        # third dimension
        latent = latent[0][:] + vector_3

        # fourth dimension
        latent = latent[0][:] - vector_4

        # second dimension
        latent[0][:216] = latent[0][:216] * dim_2

        # fifth dimension
        latent[0][:216] = latent[0][:216] * dim_5

        # sixth dimension
        latent[0][300:] = latent[0][300:] * dim_6

        fmt = dict(func=tflib.convert_images_to_uint8, nchw_to_nhwc=True)
        img = Gs.run(latent, None, truncation_psi=0.7, randomize_noise=True, output_transform=fmt)
        png = Image.fromarray(img[0], 'RGB')
        img_user = "out/custom-map.png"
        png.save(img_user)

        # global out_json
        out_dict = {'status': 'okay', 'file': img_user}
        # if there is a given ID in received json object as the 9th element,
        #  add the same ID value to the output for possible comparison
        if len(values) == 9:
            out_dict['id'] = int(values[8])

        out_json = json.dumps(out_dict)
        return out_json


with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1) 
    s.bind((HOST, PORT))
    # check and turn on TCP Keepalive
    # x = s.getsockopt( socket.SOL_SOCKET, socket.SO_KEEPALIVE)
    # if( x == 0):
    #     if args.verbose:
    #         print ("Socket Keepalive off, turning on")
    #     x = s.setsockopt( socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
    #     if args.verbose:
    #         print ("setsockopt=", x)
    # else:
    #     if args.verbose:
    #         print ("Socket Keepalive already on")
    s.listen()
    while True:
        conn, addr = s.accept()
        try:
            data = recv_msg(conn)
            print("Received data",data)
            if args.verbose:
                # got incomping data
                print("raw", data)
            # no incoming data
            if not data:
                print("break")
                break
            elif data == b'killsrv':
                if args.verbose:
                    print("terminate server")
                conn.close()
                sys.exit()
            else:
                out_json = latent_navigation(data)
                if args.verbose:
                    print("sending data back")
                send_msg(conn, out_json.encode('utf-8'))
        except KeyboardInterrupt:
            conn.close()
            sys.exit()
