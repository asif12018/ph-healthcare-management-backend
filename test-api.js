fetch('http://localhost:5000/api/v1/doctors?experience[gte]=5')
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(e => console.error(e));
