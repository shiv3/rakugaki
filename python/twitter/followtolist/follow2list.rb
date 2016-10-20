# -*- coding: utf-8 -*-

require "twitter"
require 'yaml'


def get_all_friends(client,screen_name)
  all_friends = []
  client.friend_ids(screen_name).each_slice(100).each do |slice|
    client.users(slice).each do |friend|
      all_friends << friend
    end
  end
  all_friends
end

def get_following(client,user)
   users = get_all_friends(client,user)
  #  users.each{|u| p u.screen_name}
   return users.map{|s|s.screen_name}
end

def addlist(client,users)
  list = client.create_list(users + "s_following" , options={mode:"public"})
  return list
end

twitter_token = YAML.load_file("auth.yaml")[1]
client = Twitter::REST::Client.new do |config|
  config.consumer_key        = twitter_token["consumer_key"]
  config.consumer_secret     = twitter_token["consumer_secret"]
end


user = gets
# followings = get_following(client,user)

p addlist(client,user)
