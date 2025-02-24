import socket
import struct
import numpy as np
from enum import Enum
import multiprocessing
from utils.logger import Logger
import pandas as pd
import pickle
import joblib


class Mode(Enum):
    RESOURCE = 1
    THROUGHPUT = 2


res_mps_model = joblib.load("optimal_mps_model.pkl")
res_size_model = joblib.load("optimal_size_model.pkl")

throughput_mps_model = joblib.load("throughput_opt_message_sec.pkl")
throughput_size_model = joblib.load("throughput_opt_message_size.pkl")

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)


def predict_values(features, type: Mode):

    features = np.array(features).reshape(1, -1)  # reshape for both models

    if type == Mode.RESOURCE:
        # features are like np.array([[5.0, 135.0, 150, 2048]])  # [cpuUsage, ramUsage, requestPerSec, bytesPerSec]
        predicted_mps = res_mps_model.predict(features)
        predicted_size = res_size_model.predict(features)
        return predicted_mps, predicted_size
    else:
        # features_pd = pd.DataFrame(
        #     features,
        #     columns=["cpu_usage", "ram_usage", "request_per_sec", "bytes_per_sec"],
        # )
        # Ensure features have the correct number of columns (5)
        if features.shape[1] == 4:
            features = np.hstack([features, np.zeros((features.shape[0], 1))])
        features = np.array(features).reshape(1, -1)  # reshape for both models
        input_feats = scaler.transform(features)
        predicted_mps = throughput_mps_model.predict(input_feats)
        predicted_size = throughput_size_model.predict(input_feats)
        return predicted_mps, predicted_size


def start_model_server(host="127.0.0.1", port=65432, type=Mode.THROUGHPUT):
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
                    try:
                        # Logger.info(f"Received data: {data}")
                        features = list(struct.unpack("dddd", data))
                        Logger.info(features)
                        predicted_mps, predicted_size = predict_values(features, type)

                        # Send back the response with the predicted values

                        response = struct.pack("ff", predicted_mps, predicted_size)
                        client_socket.sendall(response)
                        Logger.info(
                            f"Sent predictions: {predicted_mps}, {predicted_size}"
                        )
                    except struct.error as e:
                        Logger.error(f"Error unpacking data: {e}")
                        Logger.error(f"Data length: {len(data)}")
                else:
                    Logger.info("No data received. Closing connection.")


if __name__ == "__main__":
    Logger.info("Starting model servers")
    res_thread = multiprocessing.Process(
        target=start_model_server, args=("0.0.0.0", 65432, Mode.RESOURCE)
    )
    thr_thread = multiprocessing.Process(
        target=start_model_server, args=("0.0.0.0", 65433, Mode.THROUGHPUT)
    )
    res_thread.start()
    thr_thread.start()

    # optimal joining process for the blocking operations on both servers

    Logger.info("Joining model interfaces")
    res_thread.join()
    thr_thread.join()

    Logger.info("Server established, listening for new requests...")

    print("Started")
