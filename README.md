You should have python and node.js installed on your system.

Navigate to college_backend and run the following:

  pip install pandas </br>
  pip install geopy </br>
  pip install openpyxl </br>
  pip install django </br>
  pip install djangorestframework </br>
  pip install django-cors-headers </br>


Navigate to college_frontend and run the following:

  npm install

To run the server:

1) Navigate to college_backend directory and in the terminal, use the command-

  python manage.py runserver

(Backend server should be active and accessible at http://127.0.0.1:8000/)

2) Navigate to college_frontend and use the command-

  npm run dev

Your backend and frontend servers should now be connected and accessible at http://localhost:3000/

In case you have made changes to the csv/excel files in the backend, follow the below steps before running the servers:

1) Manually delete the file "db.sqlite3" present in the college_backend folder.
2) In your terminal navigate to college_backend folder and run the following commands:

   Python manage.py makemigrations

   Python manage.py migrate

