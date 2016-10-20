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

from types import FunctionType

user = 'hide_clone'
def get_following(user):
    statuses =  api.GetFollowers(screen_name=user)

    # following = []
    # for t in statuses:
    #     print(t.screen_name)
    return map(lambda t:t.screen_name , statuses)
        

if __name__ == '__main__':
    user_name = raw_input('Enter positive user: ')
    # following = get_following(user_name)
    list = api.CreateList(user_name + "s_following",mode="private")
