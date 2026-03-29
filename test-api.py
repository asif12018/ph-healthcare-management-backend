import requests
response = requests.get('http://localhost:5000/api/v1/doctors?experience[gte]=5')
print(response.json())
