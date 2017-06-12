const HALF_BORDER_SIZE = 10;

var Square = {
	name: 'Square',
	drawEdges: function (container, width, height) {
		var edges = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		var coords = [
			[-HALF_BORDER_SIZE, -HALF_BORDER_SIZE],
			[-HALF_BORDER_SIZE, height + HALF_BORDER_SIZE],
			[width + HALF_BORDER_SIZE, height + HALF_BORDER_SIZE],
			[width + HALF_BORDER_SIZE, -HALF_BORDER_SIZE]
		];
		var s = '';
		for (var i = 0; i < coords.length; i++) {
			s += coords[i][0].toString() + ',' + coords[i][1].toString() + ' ';
		}
		edges.setAttribute('points', s);
		container.appendChild(edges);
	}
};

var topologies = {
	'Square': Square
};
