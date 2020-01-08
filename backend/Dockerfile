FROM python:3.7-buster

RUN mkdir -p /app/media
VOLUME /app/media

COPY . /app/src
WORKDIR /app/src

RUN pip install -qUr requirements.txt

EXPOSE 8000/tcp

ENTRYPOINT ["./manage.py"]
CMD ["runserver", "0.0.0.0:8000"]
