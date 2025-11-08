FROM python:3.12.8

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt
RUN python3 -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --trusted-host pypi.python.org psycopg2 --break-system-packages
CMD ["python", "main.py"]