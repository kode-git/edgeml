import logging
from datetime import datetime

class Logger:
    INFO = 'INFO'
    WARN = 'WARN'
    ERROR = 'ERROR'
    DEBUG = 'DEBUG'

    @staticmethod
    def info(message: str) -> None:
        Logger.log(message, Logger.INFO)

    @staticmethod
    def warn(message: str) -> None:
        Logger.log(message, Logger.WARN)

    @staticmethod
    def error(message: str) -> None:
        Logger.log(message, Logger.ERROR)

    @staticmethod
    def debug(message: str) -> None:
        Logger.log(message, Logger.DEBUG)

    @staticmethod
    def log(message: str, severity: str) -> None:
        timestamp = datetime.utcnow().isoformat()
        log_message = f"[{timestamp}] {severity} - {message}"
        print(log_message)

if __name__ == "__main__":
    Logger.info("This is an info message.")
    Logger.warn("This is a warning message.")
    Logger.error("This is an error message.")
    Logger.debug("This is a debug message.")
