"""Quick test: verify messaging API works."""
import os, django, json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

BASE = 'http://localhost:8000/api'

def login(email):
    data = json.dumps({'email': email, 'password': 'password123'}).encode()
    req = Request(BASE + '/auth/login/', data=data, headers={'Content-Type': 'application/json'})
    resp = urlopen(req)
    token = json.loads(resp.read()).get('token')
    print("  Login OK:", email)
    return token

def api_get(path, token):
    req = Request(BASE + path, headers={'Authorization': 'Token ' + token})
    try:
        resp = urlopen(req)
        return json.loads(resp.read())
    except HTTPError as e:
        body = e.read().decode()[:300]
        print("  ERROR", e.code, ":", body)
        return None

def api_post(path, token, body):
    data = json.dumps(body).encode()
    req = Request(BASE + path, data=data, headers={
        'Authorization': 'Token ' + token, 'Content-Type': 'application/json'
    })
    try:
        resp = urlopen(req)
        return json.loads(resp.read())
    except HTTPError as e:
        body = e.read().decode()[:300]
        print("  ERROR", e.code, ":", body)
        return None

print("=== Testing as ADVISOR ===")
adv_token = login('advisor@example.com')
convos = api_get('/messages/conversations/', adv_token)
if convos is not None:
    print("  Conversations:", len(convos))
    for c in convos:
        name = c.get('other_name', '?')
        title = c.get('internship_title', '?')
        unread = c.get('unread_count', 0)
        print("    -", name, "(", title, ") | unread:", unread)

    if convos:
        aid = convos[0]['assignment_id']
        msgs = api_get('/messages/' + str(aid) + '/', adv_token)
        if msgs:
            print("  Messages:", len(msgs.get('messages', [])))

print()
print("=== Testing as STUDENT (Yonas) ===")
stu_token = login('yonas@example.com')
convos2 = api_get('/messages/conversations/', stu_token)
if convos2 is not None:
    print("  Conversations:", len(convos2))
    if convos2:
        aid2 = convos2[0]['assignment_id']
        result = api_post('/messages/send/', stu_token, {
            'assignment_id': aid2,
            'content': 'Thanks for the support!'
        })
        if result:
            print("  Sent message OK, id:", result.get('id'))

print()
print("DONE")
