var Topology = {
	name: 'name of Topology',
	addEdges: function (container, width, height) {
		// draw the edges of the board and indicate the chosen topology
		// return nothing
	},
	getAvailableArrows: function (tiles) {
		// return a list of bools [ north, south, west, east ]
		// True if arrow is available, else false
	},
	getArrowTarget: function (tiles, direction, offset) {
		// return null if arrow at direction, offset is not available;
		// else return coordinates (x, y) of the target tile
	}
};