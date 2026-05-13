import requests
r = requests.post('http://localhost:8000/api/oauth/google/', json={'access_token': 'test_token'})
print('Status:', r.status_code)
print('Body:', r.text[:3000])
