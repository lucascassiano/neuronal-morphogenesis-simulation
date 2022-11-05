import redis
import json


class _UI:
    def __init__(self, host, port, db, channel) -> None:
        self.channel = channel
        self.redis = redis.Redis(host, port, db)
        pass

    def setName(self, name):
        self.name = name

    def getName(self):
        return self.name

    def send(self, data):
        print("sending", data)
        return self.redis.publish(self.channel, json.dumps(data))


UI = _UI("localhost", 6379, 0, "bio-growth")
