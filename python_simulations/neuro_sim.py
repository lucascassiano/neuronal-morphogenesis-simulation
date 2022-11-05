from ctypes import sizeof
from os import kill
from typing import Set
import simpy
import logging
from nanoid import generate
import redis
import json
from vector3d.vector import Vector, from_points
from vector3d.point import Point, distance
import random
import math

# core imports
from core.Node import Node
from core.AttractorsField import AttractorsField, AttractionTypes

# init REDIS client
r = redis.Redis(host="localhost", port=6379, db=0)
CHANNEL = "bio-growth"


class Neuron(object):
    def __init__(self, position, env, resource, metaAttractors):
        self.env = env
        self.id = generate("1234567890abcdef", 10)  # => nano id -> "IRFa-VaY2b"
        self.action = env.process(self.run())
        self.position = position
        self.attractors = []
        self.dendrites = []
        self.axon = []
        self.attractorsFields = []

        testAttractorField = AttractorsField(
            Vector(0, 1.5, 0), diameter=1, count=100, parentNeuron=self.id
        )

        self.drawAttractorsField(testAttractorField)

        testAttractorField2 = AttractorsField(
            Vector(2, 1, 0), diameter=0.5, count=10, parentNeuron=self.id
        )

        self.attractorsFields.append(testAttractorField)
        self.attractorsFields.append(testAttractorField2)

        self.metaAttractors = metaAttractors

        print(self.metaAttractors)
        data = {
            "cmd": "ADD_NEURON",
            "id": self.id,
            "type": "NEURON",
            "position": position.toDict(),
        }

        r.publish(CHANNEL, json.dumps(data))

        self.basalAttractorsField = AttractorsField(
            self.position,
            diameter=1,
            count=100,
            parentNeuron=self.id,
            attracts=AttractionTypes.AXON,
        )

        self.drawAttractorsField(self.basalAttractorsField)

        metaAttractors.append(self.basalAttractorsField)

        self.attractors = self.basalAttractorsField.attractors

        self.p = r.pubsub()
        self.p.subscribe(CHANNEL)

        self.addAxon(self.position, Vector(0, 0, 0))
        self.addDentrite(self.position, Vector(0, 0, 0))

    def drawAttractorsField(self, attractorsField):
        data = attractorsField.draw()
        r.publish(CHANNEL, json.dumps(data))

    def getAttractors(self):
        return self.attractors

    # attractor fields
    def getAxonAttractors(self):
        attractors = []

        c = Vector(0,2,0);
        attractors.append(c)
        print("attractors", self.attractors)

        for field in self.attractors:
            print(field.x)

        return self.attractors

    def getClosestAttractor(self, position):
        closestAttractorDistance = 20
        closestAttractor = None
        closestAttractorIndex = 0

        for index, attractor in enumerate(self.attractors):

            dist = distance(position, attractor)
            print(index, dist)
            if dist < closestAttractorDistance:
                closestAttractor = attractor
                closestAttractorIndex = index
                closestAttractorDistance = dist

        return closestAttractorIndex, closestAttractor

    # grow branch nodes
    def growNodes(self, nodesArray, attractors):
        influencedNodes = []

        # find influences
        for index, attractor in enumerate(attractors):
            _, closestNode = self.getClosestNode(nodesArray, attractor)
            if not closestNode:
                continue
            closestNode.nearByAttractors.append(attractor)
            influencedNodes.append(closestNode)

        # grow the network
        for index, node in enumerate(influencedNodes):
            avgDirection = Vector()
            for attractor in node.nearByAttractors:
                # print(node, attractor)
                avgDirection.__iadd__(attractor.__sub__(node.end)).normalize()

            # Add small amount of random "jitter" to avoid getting stuck between two attractors and endlessly generating nodes in the same place
            # (Credit to Davide Prati (edap) for the idea, seen in ofxSpaceColonization)
            randomFactor = 0.1
            randomVector = Vector(
                random.randrange(-1, 1) * randomFactor,
                random.randrange(-1, 1) * randomFactor,
                random.randrange(-1, 1) * randomFactor,
            )
            avgDirection.__iadd__(randomVector).normalize()
            avgDirection = avgDirection.divide(len(node.nearByAttractors))

            nextNode = node.generateNextNode(avgDirection)
            if nextNode:
                self.addNode(nodesArray, node=nextNode)

    def getClosestNode(self, nodes, attractor, attractionDistance=20):
        closestNode = None
        record = attractionDistance
        defaultKillDistance = 0.1

        for index, node in enumerate(nodes):
            dist = distance(attractor, node.end)
            killDistance = defaultKillDistance

            if node.attractorMaxDistance:
                killDistance = node.attractorMaxDistance

            # kill attractor
            if dist < killDistance:
                try:
                    self.attractors.remove(attractor)
                except:
                    pass
            # get node
            if dist < record:
                closestNode = node
                record = dist

        return index, closestNode

    def addDentrite(self, start, end, draw=True):
        config = {"maxChildren": 3}
        return self.addNode(self.dendrites, config, start, end, draw=True)

    def drawNode(self, node):
        data = node.draw()
        r.publish(CHANNEL, json.dumps(data))

    def addAxon(self, start, end, draw=True):
        config = {"branchSize": 0.05, "maxChildren": 3}
        node = self.addNode(self.axon, config, start, end, draw=True, nodeType="AXON")
        return node

    def addNode(
        self,
        nodesArray,
        config={},
        start=Vector(),
        end=Vector(),
        draw=True,
        node=None,
        nodeType="BASAL_DENDRITE",
    ):

        if not node:
            node = Node(config, start, end, parentNeuron=self.id, nodeType=nodeType)

        nodesArray.append(node)

        if draw:
            self.drawNode(node)

        return node

    def run(self):
        while True:
            # grow basal dendrites
            self.growNodes(self.dendrites, self.attractors)

            # calculate MetaAttractors
            axonAttractors = self.getAxonAttractors()

            # simplify fields into points
            for field in self.attractorsFields:
                axonTip = self.axon[-1].end
                if distance(axonTip, field.position) < field.diameter / 2:
                    axonAttractors = field.attractors

            # print(axonAttractors)
            self.growNodes(self.axon, axonAttractors)

            yield self.env.timeout(1)


def cleanSimulation():
    data = {"cmd": "CLEAN"}
    r.publish(CHANNEL, json.dumps(data))


def runSimulation():
    print("starting simulation")

    env = simpy.Environment()
    resource = simpy.Resource(env, capacity=10)

    metaAttractors = []

    pos = Vector(0, 0, 0)
    actor = Neuron(pos, env, resource, metaAttractors)

    env.run(until=30)


if __name__ == "__main__":
    cleanSimulation()
    runSimulation()
