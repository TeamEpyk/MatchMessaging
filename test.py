import requests
import unittest

class TestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pass

    @classmethod
    def tearDownClass(cls):
        pass

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_login(self):
        #No headers
        response = requests.post('https://epyk-chat.herokuapp.com/user_login')
        self.assertTrue(response.text.find("Error")>-1)

        #User id in database
        user = {
            'uid': 'P9L1prQoxjOBw7N203Yi48hinAo2',
            'displayName': 'TestUser',
            'photoURL': 'picture.com'
        }
        response = requests.post('https://epyk-chat.herokuapp.com/user_login', user)
        self.assertTrue(response.text.find("Error")==-1)

        #User id not in database
        user = {
            'uid': 'NotReal',
            'displayName': 'TestUser',
            'photoURL': 'picture.com'
        }
        response = requests.post('https://epyk-chat.herokuapp.com/user_login', user)
        self.assertTrue(response.text.find("Error")==-1)

    def test_send_message(self):
        #No headers
        response = requests.post('https://epyk-chat.herokuapp.com/send_message')
        self.assertTrue(response.text.find("Error")>-1)

        #Invalid user
        headers = {
            's': 'FakeNews',
            'r': 'P9L1prQoxjOBw7N203Yi48hinAo2',
            'm': 'Test Message'
        }
        response = requests.post('https://epyk-chat.herokuapp.com/send_message', headers)
        self.assertTrue(response.text=='failure')

        #Everything valid
        headers = {
            's': 'P9L1prQoxjOBw7N203Yi48hinAo2',
            'r': 'P9L1prQoxjOBw7N203Yi48hinAo2',
            'm': 'Test Message'
        }
        response = requests.post('https://epyk-chat.herokuapp.com/send_message', headers)
        self.assertTrue(response.text=='success')

    def test_add_friend(self):
        #No headers
        response = requests.post('https://epyk-chat.herokuapp.com/add_friend')
        self.assertTrue(response.text.find("Error")>-1)

        #Invalid user
        headers = {
            'uid2': 'FakeNews',
            'uid1': 'P9L1prQoxjOBw7N203Yi48hinAo2',
        }
        response = requests.post('https://epyk-chat.herokuapp.com/add_friend', headers)
        self.assertTrue(response.text=='Something went wrong...')

        #Everything valid
        headers = {
            's': 'P9L1prQoxjOBw7N203Yi48hinAo2',
            'r': 'P9L1prQoxjOBw7N203Yi48hinAo2',
            'm': 'Test Message'
        }
        response = requests.post('https://epyk-chat.herokuapp.com/add_friend', headers)
        self.assertTrue(response.text.find('Error')==-1)

    # Add Your Test Cases Here...

# Main: Run Test Cases
if __name__ == '__main__':
    unittest.main()

