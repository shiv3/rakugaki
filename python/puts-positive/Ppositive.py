#-*- encoding:utf-8
import urlparse
import oauth2 as oauth
import twitter,yaml
import re,dateutil.parser

def get_access_token(consumer_key,consumer_secret):
    request_token_url = 'https://api.twitter.com/oauth/request_token'
    access_token_url = 'https://api.twitter.com/oauth/access_token'
    authorize_url = 'https://api.twitter.com/oauth/authorize'
    consumer = oauth.Consumer(consumer_key, consumer_secret)
    client = oauth.Client(consumer)
    resp, content = client.request(request_token_url, "GET")
    if resp['status'] != '200':
        raise Exception("Invalid response %s." % resp['status'])
    request_token = dict(urlparse.parse_qsl(content))
    return request_token

auth = yaml.load(file("auth.yaml"))[0]
# oauth =  get_access_token(consumer_key,consumer_secret)

api = twitter.Api(auth["consumer_key"],
                  auth["consumer_secret"],
                  auth["access_token_key"],
                  auth["access_token_secret"]
                 )

USERS = ['hide_clone']

statuses =  api.GetUserTimeline(screen_name="hide_clone",count=10)

positive = []
r = re.compile(u'、[^、]*、')
for t in statuses:
    if not r.search(t.text) is None:
        positive.append( [ t.text.split(u"、") , t.created_at ])

for p in positive:
    date = dateutil.parser.parse(p[1])
    print  str(date.month) + "/"  + str(date.day) + " " + ",".join(p[0])

