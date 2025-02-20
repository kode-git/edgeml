FROM python:3.12-slim

WORKDIR /app

COPY ./src/model/src ./

COPY ./src/model/src/requirements.txt requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 65433
EXPOSE 65432
CMD ["python", "app.py"]
# CMD ["tail", "-f", "/dev/null"]