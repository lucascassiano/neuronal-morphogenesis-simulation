from vector3d.vector import Vector, from_points
import uuid


class Node(object):
    def __init__(
        self, config, start, end, nodesToRoot=0, parentNeuron=None, nodeType=None
    ):
        super().__init__()
        self.id = str(uuid.uuid4())
        self.start = start
        self.end = end  # starts with size = 0
        self.children = []  # can grow arms
        self.nearByAttractors = []
        self.isTip = True
        self.isRoot = True
        self.processed = False
        self.parentNeuron = parentNeuron
        self.nodeType = nodeType

        # growth parameters
        self.params = {
            "maxChildren": 3,
            "branchSize": 0.25,
            "attractorMaxDistance": 0.001,
            "levels": {
                1: {  # nodesToRoot = 4
                    "maxChildren": 1  # the node loses capability of growing more nodes from self.
                },
                15: {"maxChildren": 6},
            },
        }

        if config:
            self.params.update(config)

        # configuration
        self.maxChildren = self.params["maxChildren"]
        self.branchSize = self.params["branchSize"]  # default

        self.insideField = False  # if the axon is inside an attractors field
        # max distance an attractor can be to be effective to this node
        self.attractorMaxDistance = 0.001

        self.nodesToRoot = nodesToRoot  # how many nodes between current node and source

    def generateNextNode(self, direction, params=None):
        nextNodesToRoot = self.nodesToRoot + 1
        levelParams = None

        if nextNodesToRoot in self.params["levels"]:
            levelParams = self.params["levels"][nextNodesToRoot]

        if len(self.children) < self.maxChildren:
            self.isTip = False

            nextPosition = self.end.__add__(direction.multiply(self.branchSize))

            childParams = self.params.copy()
            if params:
                childParams.update(params)

            if levelParams:
                childParams.update(levelParams)

            nextNode = Node(
                childParams,
                self.end,
                nextPosition,
                nextNodesToRoot,
                parentNeuron=self.parentNeuron,
            )

            nextNode.isRoot = False
            nextNode.nodesToRoot = nextNodesToRoot
            self.children.append(nextNode)
            return nextNode

        return None

    def draw(self):
        base = self.nodesToRoot
        if base == 0:
            base = 1

        thickness = (1 / base) * 0.2
        data = {
            "cmd": "ADD_NODE",
            "id": self.id,
            "type": "NODE",
            "start": self.start.toDict(),
            "end": self.end.toDict(),
            "nodesToRoot": self.nodesToRoot,
            "nodeType": self.nodeType,
            "parentNeuron": self.parentNeuron,
            "thickness": thickness,
        }

        return data
