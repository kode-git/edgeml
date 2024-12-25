import socket
from utils.logger import Logger

def start_server(host='127.0.0.1', port=65432):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((host, port))
        Logger.info(f"Server started, listening on {host}:{port}")
        server_socket.listen(5)
        
        while True:
            client_socket, client_address = server_socket.accept()
            with client_socket:
                Logger.info(f"Connection established with {client_address}")
                data = client_socket.recv(1024)
                if data:
                    Logger.info(f"Received message: {data.decode()}")
                else:
                    Logger.info("No data received. Closing connection.")

if __name__ == '__main__':
    start_server()