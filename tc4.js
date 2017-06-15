const TILE_SIZE = 100;
const BORDER_SIZE = 20;
const HALF_BORDER_SIZE = 10;
const Direction = {
	NORTH: 0,
	NORTHEAST: 1,
	EAST: 2,
	SOUTHEAST: 3,
	SOUTH: 4,
	SOUTHWEST: 5,
	WEST: 6,
	NORTHWEST: 7,
	names: {
		0: 'NORTH',
		1: 'NORTHEAST',
		2: 'EAST',
		3: 'SOUTHEAST',
		4: 'SOUTH',
		5: 'SOUTHWEST',
		6: 'WEST',
		7: 'NORTHWEST'
	},
	CARDINAL: [0, 2, 4, 6],
	INTERCARDINAL: 8,
	HALF_INTERCARDINAL: 4
};

// Define the topologies

var Square = {
	name: 'Square',
	addEdges: function (container, width, height) {
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
	},
	projectCoords: function (indices, width, height) {
		return indices.filter(function (value) {
			return value[0] >= 0 && value[0] < width && value[1] >= 0 && value[1] < height;
		});
	}
};

var Cylinder = {
	name: 'Cylinder',
	addEdges: function (container, width, height) {
		var edges = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		var coords = [
			[HALF_BORDER_SIZE, -HALF_BORDER_SIZE],
			[HALF_BORDER_SIZE, height + HALF_BORDER_SIZE],
			[width - HALF_BORDER_SIZE, height + HALF_BORDER_SIZE],
			[width - HALF_BORDER_SIZE, -HALF_BORDER_SIZE]
		];
		var s = '';
		for (var i = 0; i < coords.length; i++) {
			s += coords[i][0].toString() + ',' + coords[i][1].toString() + ' ';
		}
		edges.setAttribute('points', s);
		container.appendChild(edges);
	},
	projectCoords: function (indices, width, height) {
		indices = indices.filter(function (value) {
			return value[1] >= 0 && value[1] < height;
		});
		return indices.map(function (value) {
			return [(value[0] + width) % width, value[1]];
		});
	}
};

var topologies = {
	'Square': Square,
	'Cylinder': Cylinder
};

// Utility functions
var Array2D = function (width, height) {
	var grid = new Array(width);
	for (var i = 0; i < width; i++) {
		grid[i] = new Array(height);
	}
	return grid;
};

var clearNode = function (node) {
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
};

var countRun = function (needle, haystack) {
	// largest n such that haystack[i] == needle, for all i <= n
	for (var i = 0; i < haystack.length; i++) {
		if (haystack[i] !== needle) {
			break;
		}
	}
	return i;
};

// main game object
var game = {
	svg: null,
	tiles: null,
	tileNodes: null,
	width: null,
	height: null,
	topology: null,
	listeners: {
		arrows: null,
		tiles: null
	},
	player: 0,
	playerColors: ['', '#ffbfbf', '#cfdef7']
};

// Utility
game.tileAtCoord = function (coordinate) {
	return this.tileNodes[coordinate[0]][coordinate[1]];
};

game.valueAtCoord = function (coordinate) {
	return this.tiles[coordinate[0]][coordinate[1]];
};

// state setup
game.new = function (options) {
	this.topology = topologies[options['topology']];
	this.width = options['width'];
	this.height = options['height'];
	this.tiles = Array2D(this.width, this.height);
	this.tileNodes = Array2D(this.width, this.height);
	this.player = 0;
	this.setupSVG();
	this.addBoard();
	this.addTiles();
	this.addArrows();
	this.updateArrows();
	this.togglePlayer();
	document.body.classList.remove('setup');
};

game.setupSVG = function () {
	var width = (this.width + 2) * TILE_SIZE + BORDER_SIZE;
	var height = (this.height + 2) * TILE_SIZE + BORDER_SIZE;
	this.svg.setAttribute('width', width);
	this.svg.setAttribute('height', height);

	this.svg.setAttribute('viewBox',
		'-' + (TILE_SIZE + BORDER_SIZE).toFixed() +
		' -' + (TILE_SIZE + BORDER_SIZE).toFixed() +
		' ' + width.toFixed() +
		' ' + height.toFixed()
	);
};

game.addBoard = function () {
	var container = this.svg.getElementById('board-group');
	container.setAttribute('class', this.topology.name);
	clearNode(container);
	// var board = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	// board.setAttribute('id', 'board');
	var width = this.width * TILE_SIZE;
	var height = this.height * TILE_SIZE;
	// board.setAttribute('width', width);
	// board.setAttribute('height', height);
	// container.appendChild(board);
	this.topology.addEdges(container, width, height);
};

game.addArrows = function () {
	this.listeners.arrows = new Array(2 * this.width + 2 * this.height);
	var x;
	var y;
	var click;
	var over;
	var out;
	var arrows = this.svg.getElementById('arrows');
	clearNode(arrows);
	var offset = 0;
	for (x = 0; x < this.width; x++) {
		var north = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		north.setAttribute('x', (x + 0.5) * TILE_SIZE);
		north.setAttribute('y', 0);
		north.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-north');
		over = this.onArrowOver.bind(this, Direction.NORTH, x);
		click = this.onArrowClick.bind(this, Direction.NORTH, x);
		out = this.onArrowOut.bind(this, Direction.NORTH, x);
		this.listeners.arrows[offset + x] = [over, click, out];
		north.addEventListener('mouseover', over);
		north.addEventListener('click', click);
		north.addEventListener('mouseout', out);
		arrows.appendChild(north);
	}
	offset += this.width;
	for (x = 0; x < this.width; x++) {
		var south = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		south.setAttribute('x', (x + 0.5) * TILE_SIZE);
		south.setAttribute('y', this.height * TILE_SIZE);
		south.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-south');
		over = this.onArrowOver.bind(this, Direction.SOUTH, x);
		click = this.onArrowClick.bind(this, Direction.SOUTH, x);
		out = this.onArrowOut.bind(this, Direction.SOUTH, x);
		this.listeners.arrows[offset + x] = [over, click, out];
		south.addEventListener('mouseover', over);
		south.addEventListener('click', click);
		south.addEventListener('mouseout', out);
		arrows.appendChild(south);
	}
	offset += this.width;
	for (y = 0; y < this.height; y++) {
		var west = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		west.setAttribute('x', 0);
		west.setAttribute('y', (y + 0.5) * TILE_SIZE);
		west.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-west');
		over = this.onArrowOver.bind(this, Direction.WEST, y);
		click = this.onArrowClick.bind(this, Direction.WEST, y);
		out = this.onArrowOut.bind(this, Direction.WEST, y);
		this.listeners.arrows[offset + y] = [over, click, out];
		west.addEventListener('mouseover', over);
		west.addEventListener('click', click);
		west.addEventListener('mouseout', out);
		arrows.appendChild(west);
	}
	offset += this.height;
	for (y = 0; y < this.height; y++) {
		var east = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		east.setAttribute('x', this.width * TILE_SIZE);
		east.setAttribute('y', (y + 0.5) * TILE_SIZE);
		east.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-east');
		over = this.onArrowOver.bind(this, Direction.EAST, y);
		click = this.onArrowClick.bind(this, Direction.EAST, y);
		out = this.onArrowOut.bind(this, Direction.EAST, y);
		this.listeners.arrows[offset + y] = [over, click, out];
		east.addEventListener('mouseover', over);
		east.addEventListener('click', click);
		east.addEventListener('mouseout', out);
		arrows.appendChild(east);
	}
};

game.addTiles = function () {
	this.listeners.tiles = new Array(this.width * this.height);
	var i = 0;
	for (var x = 0; x < this.width; x++) {
		for (var y = 0; y < this.height; y++) {
			this.tiles[x][y] = 0;
			var tile = document.createElementNS('http://www.w3.org/2000/svg', 'use');
			tile.setAttribute('x', x * TILE_SIZE);
			tile.setAttribute('y', y * TILE_SIZE);
			tile.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#tile');
			var over = this.onTileOver.bind(this, x, y);
			var out = this.onTileOut.bind(this, x, y);
			this.listeners.tiles[i] = [over, out];
			tile.addEventListener('mouseover', over);
			tile.addEventListener('mouseout', out);
			this.svg.getElementById('tiles').appendChild(tile);
			this.tileNodes[x][y] = tile;
			i++;
		}
	}
};

game.addToken = function (x, y, player) {
	// check (player == 1 or 2) and this.tiles[x][y] === 0
	this.tiles[x][y] = player;
	var container = this.svg.getElementById('tokens');
	var token = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	token.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#token');
	token.setAttribute('class', 'player' + player.toString());
	token.setAttribute('x', x * TILE_SIZE);
	token.setAttribute('y', y * TILE_SIZE);
	container.appendChild(token);
};

game.moveGhostToken = function (x, y, player) {
	var ghost = this.svg.getElementById('ghost');
	if (player === 0) {
		ghost.classList.add('invis');
	} else {
		ghost.classList.remove('invis');
		ghost.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#token');
		ghost.setAttribute('class', 'player' + player.toString());
		ghost.setAttribute('x', x * TILE_SIZE);
		ghost.setAttribute('y', y * TILE_SIZE);
	}
};

game.freeze = function (classname) {
	// destroy event listeners; show 'restart' option
	if (classname === 'draw') {
		document.body.setAttribute('class', 'draw');
	} else {
		document.body.classList.add('winner');
	}
	var i;
	var tiles = this.svg.getElementById('tiles').childNodes;
	for (i = 0; i < tiles.length; i++) {
		tiles[i].removeEventListener('mouseover', this.listeners.tiles[i][0]);
		tiles[i].removeEventListener('mouseout', this.listeners.tiles[i][1]);
	}
	this.listeners.tiles = null;
	var arrows = this.svg.getElementById('arrows').childNodes;
	for (i = 0; i < arrows.length; i++) {
		arrows[i].removeEventListener('mouseover', this.listeners.arrows[i][0]);
		arrows[i].removeEventListener('click', this.listeners.arrows[i][1]);
		arrows[i].removeEventListener('mouseout', this.listeners.arrows[i][2]);
	}
	this.listeners.arrows = null;
};

// event listeners
game.onTileOver = function (x, y, e) {
	e.target.classList.add('highlight0');
	for (var direction = 0; direction < Direction.INTERCARDINAL; direction++) {
		var indices = this.getRay(direction, x, y);
		for (var i = 0; i < indices.length; i++) {
			var x2 = indices[i][0];
			var y2 = indices[i][1];
			this.tileNodes[x2][y2].classList.add('highlight' + (i + 1).toString());
		}
	}
};

game.onTileOut = function (x, y, e) {
	var tiles = this.svg.getElementById('tiles').childNodes;
	for (var i = 0; i < tiles.length; i++) {
		tiles[i].setAttribute('class', '');
	}
};

game.onArrowClick = function (direction, offset, e) {
	var target = this.getArrowTarget(direction, offset);
	// assert target not null
	game.addToken(target[0], target[1], this.player);
	game.nextTurn(target[0], target[1]);
};

game.onArrowOver = function (direction, offset, e) {
	var target = this.getArrowTarget(direction, offset);
	this.moveGhostToken(target[0], target[1], this.player);
};

game.onArrowOut = function (direction, offset, e) {
	this.moveGhostToken(null, null, 0);
};

// game logic
game.getAvailableArrows = function () {
	var output = new Array(2 * this.width + 2 * this.height);
	var offset = 0;
	var x;
	for (x = 0; x < this.width; x++) {
		output[offset + x] = this.tiles[x][0] === 0;
	}
	offset += this.width;
	for (x = 0; x < this.width; x++) {
		output[offset + x] = this.tiles[x][this.height - 1] === 0;
	}
	offset += this.width;
	var y;
	for (y = 0; y < this.height; y++) {
		output[offset + y] = this.tiles[0][y] === 0;
	}
	offset += this.height;
	for (y = 0; y < this.height; y++) {
		output[offset + y] = this.tiles[this.width - 1][y] === 0;
	}
	return output;
};

game.getArrowTarget = function (direction, offset) {
	var x;
	var y;
	switch (direction) {
		case Direction.NORTH:
			x = offset;
			if (this.tiles[x][0] !== 0) {
				break;
			}
			for (y = 1; y < this.height; y++) {
				if (this.tiles[x][y] !== 0) {
					break;
				}
			}
			return [x, y - 1];
		case Direction.SOUTH:
			x = offset;
			if (this.tiles[x][this.height - 1] !== 0) {
				break;
			}
			for (y = this.height - 1; y >= 0; y--) {
				if (this.tiles[x][y] !== 0) {
					break;
				}
			}
			return [x, y + 1];
		case Direction.WEST:
			y = offset;
			if (this.tiles[0][y] !== 0) {
				break;
			}
			for (x = 1; x < this.width; x++) {
				if (this.tiles[x][y] !== 0) {
					break;
				}
			}
			return [x - 1, y];
		case Direction.EAST:
			y = offset;
			if (this.tiles[this.width - 1][y] !== 0) {
				break;
			}
			for (x = this.height - 1; x >= 0; x--) {
				if (this.tiles[x][y] !== 0) {
					break;
				}
			}
			return [x + 1, y];
	}
	return null;
};

game.getPointInRay = function (direction, i, x, y) {
	switch (direction) {
		case Direction.NORTH:
			return [x, y - i];
		case Direction.SOUTH:
			return [x, y + i];
		case Direction.WEST:
			return [x - i, y];
		case Direction.EAST:
			return [x + i, y];
		case Direction.NORTHEAST:
			return [x + i, y - i];
		case Direction.NORTHWEST:
			return [x - i, y - i];
		case Direction.SOUTHEAST:
			return [x + i, y + i];
		case Direction.SOUTHWEST:
			return [x - i, y + i];
	}
};

game.getRay = function (direction, x, y) {
	var indices = [];
	for (var i = 1; i < 4; i++) {
		indices.push(this.getPointInRay(direction, i, x, y));
	}
	indices = this.topology.projectCoords(indices, this.width, this.height);
	return indices;
};

game.testWinner = function (x, y) {
	var placer = this.tiles[x][y];
	// assert placer !== 0
	for (var direction = 0; direction < Direction.HALF_INTERCARDINAL; direction++) {
		var forward = this.getRay(direction, x, y);
		var fvalues = forward.map(this.valueAtCoord, this);
		var fcount = countRun(placer, fvalues);
		var backward = this.getRay(direction + Direction.HALF_INTERCARDINAL, x, y);
		var bvalues = backward.map(this.valueAtCoord, this);
		var bcount = countRun(placer, bvalues);
		if ((fcount + bcount) >= 3) {
			return backward.slice(0, bcount).concat(forward.slice(0, fcount));
		}
	}
	return null;
};

game.updateArrows = function () {
	var available = this.getAvailableArrows();
	var arrows = this.svg.getElementById('arrows');
	for (var i = 0; i < available.length; i++) {
		arrows.childNodes[i].setAttribute(
			'class', available[i] ? 'available' : '');
	}
};

game.nextTurn = function (lastx, lasty) {
	var available = this.getAvailableArrows();
	if (available.length === 0) {
		console.info('DRAW');
		game.freeze('draw');
	}
	var result = game.testWinner(lastx, lasty);
	if (result !== null) {
		this.tileNodes[lastx][lasty].classList.add('winner');
		for (var i = 0; i < result.length; i++) {
			var tile = this.tileAtCoord(result[i]);
			tile.classList.add('winner');
		}
		game.freeze('player' + this.player.toString());
	} else {
		this.togglePlayer();
	}
	game.updateArrows();
};

game.togglePlayer = function () {
	if (this.player === 1) {
		this.player = 2;
	} else {
		this.player = 1;
	}

	var now = 'player' + this.player.toString();
	var not = 'player' + (3 - this.player).toString();

	document.body.classList.add(now);
	document.body.classList.remove(not);
	var metas = document.getElementsByClassName('mobile-color');
	for (var i = 0; i < metas.length; metas++) {
		metas[i].content = this.playerColors[this.player];
	}
};

// HTML UI and startup
var startup = function () {
	game.svg = document.getElementById('grid');
	document.getElementById('new_game').addEventListener('submit', processForm);
};

var processForm = function (e) {
	e.preventDefault();
	var options = {
		'topology': this.elements['topology'].value,
		'width': this.elements['xrange'].valueAsNumber,
		'height': this.elements['yrange'].valueAsNumber
	};
	game.new(options);
};

document.addEventListener('DOMContentLoaded', startup);
