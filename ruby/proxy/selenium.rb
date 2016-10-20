require "selenium-webdriver"

driver = Selenium::WebDriver.for :chrome
driver.manage.timeouts.implicit_wait = 10

driver.get "https://mobile.twitter.com/signup?type=email"
username = driver.find_element(:name, 'oauth_signup_client[fullname]')
username.send_keys('gorigorira11111')
mailaddress = driver.find_element(:class, 'phone').find_element(:class, 'input-wrapper').find_element(:tag_name, 'input')
mailaddress.send_keys('gorigori112'  +rand.to_s[3,4]+  '@gori.gori')
submit = driver.find_element(:class, 'w-button-default')
submit.click


pass = driver.find_element(:class, 'text-input')
pass.send_keys('gorigori112@gori.gori')

imahasinai = driver.find_element(:class, 'submit-link')
imahasinai.click


sleep 10

driver.quit
