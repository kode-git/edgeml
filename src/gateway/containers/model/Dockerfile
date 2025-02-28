FROM python:3.10-slim

WORKDIR /app

COPY ./src/model/src ./

COPY ./src/model/src/requirements.txt requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 65415
EXPOSE 65414
CMD ["python", "app.py"]