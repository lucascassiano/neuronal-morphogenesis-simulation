from vector3d.vector import Vector
import uuid
from .ui import UI


class NeuronConfiguration:
    name = None
    position = Vector()

    def __init__(self) -> None:
        pass


# class NeuronNode:


class Neuron:
    def __init__(self, env, config: NeuronConfiguration):
        self.id = uuid.uuid4()
        self.env = env
        self.position = config.position or Vector()
        self.nodes = []
        
        # Start the run process everytime an instance is created.
        self.action = self.env.process(self.run())

    def init(self):
        self.action = self.env.process(self.run())

    def run(self):
        while True:
            print("Start parking and charging at %d" % self.env.now)
            charge_duration = 5
            UI.send("hello")
            # We yield the process that process() returns
            # to wait for it to finish
            yield self.env.process(self.charge(charge_duration))

            print("Start driving at %d" % self.env.now)
            trip_duration = 2
            yield self.env.timeout(trip_duration)

    def charge(self, duration):
        yield self.env.timeout(duration)
