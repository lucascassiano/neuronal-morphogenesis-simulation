from nanoid import generate
from vector3d.vector import Vector, from_points
from vector3d.point import Point, distance
import random
import math

from enum import Enum


class AttractionTypes(Enum):
    AXON = 1
    DENDRITE = 2


class AttractorsField(object):
    def __init__(
        self,
        position=Vector(0, 0, 0),
        diameter=1,
        count=100,
        parentNeuron=None,
        intensity=1,
        attracts=AttractionTypes.AXON,
    ):
        self.id = generate("1234567890abcdef", 10)
        self.attractors = []
        self.position = position
        self.diameter = diameter
        self.attractorsList = []
        self.radius = self.diameter / 2
        self.parentNeuron = parentNeuron
        self.intensity = intensity
        self.attracts = attracts  # attracts axons

        # add random points on spherical coordinates
        for attractor in range(count):
            radius = random.random() * self.radius
            phi = random.randrange(0, 360)
            phi = math.radians(phi)

            theta = random.randrange(0, 360)
            theta = math.radians(theta)

            x = radius * math.sin(phi) * math.cos(theta)
            y = radius * math.sin(phi) * math.sin(theta)
            z = radius * math.cos(phi)

            position = Vector(x, y, z)

            self.attractors.append(position)

            self.attractorsList.append(position.x)
            self.attractorsList.append(position.y)
            self.attractorsList.append(position.z)

    def draw(self):
        data = {
            "cmd": "ADD_ATTRACTORS_FIELD",
            "id": self.id,
            "type": "ATTRACTOR_FIELD",
            "position": self.position.toDict(),
            "diameter": self.diameter,
            "attractors": self.attractorsList,
            "parentNeuron": self.parentNeuron,
        }
        return data

    # if a vector is inside the volume (sphere)
    def isInside(self, position):
        return distance(position, self.position) < self.diameter / 2
