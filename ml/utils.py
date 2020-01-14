import struct


def send_msg(conn, msg):
    """
    Prefix each message with an integer (4 bytes) containing length of message
    :param conn: socket connection
    :param msg: string containing msg
    """
    msg = struct.pack('>I', len(msg)) + msg
    conn.sendall(msg)


def recv_msg(conn):
    """
    Receive message with length prefix
    :param conn: socket connection
    :return: message
    """
    # Read message length (4-byte integer)
    n_message = _recv_msg_n(conn, 4)
    if not n_message:
        return None
    n_message = struct.unpack('>I', n_message)[0]
    # Read the message data
    data = _recv_msg_n(conn, n_message)
    return data


def _recv_msg_n(conn, n):
    """
    Receive n bytes
    :param conn: socket connection
    :param n: #bytes
    :return: byte array
    """
    # Helper function to receive n bytes or return None
    data = bytearray()
    while len(data) < n:
        packet = conn.recv(n - len(data))
        if not packet:
            return None
        data.extend(packet)
    return data
