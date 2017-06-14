const TILE_SIZE = 100;
const BORDER_SIZE = 20;
const HALF_BORDER_SIZE = 10;
const Direction = {
	NORTH: 0,
	SOUTH: 1,
	WEST: 2,
	EAST: 3,
	names: {
		0: 'NORTH',
		1: 'SOUTH',
		2: 'WEST',
		3: 'EAST'
	}
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
};

var topologies = {
	'Square': Square
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

// main game object
var game = {
	svg: null,
	tiles: null,
	width: null,
	height: null,
	topology: null,
	player: 0,
	playerColors: ['', '#ffbfbf', '#cfdef7']
};

// state setup
game.new = function (options) {
	this.topology = topologies[options['topology']];
	this.width = options['width'];
	this.height = options['height'];
	this.tiles = Array2D(this.width, this.height);
	this.player = 0;
	this.setupSVG();
	this.addBoard();
	for (var x = 0; x < this.width; x++) {
		for (var y = 0; y < this.height; y++) {
			this.tiles[x][y] = 0;
			this.addTile(x, y);
		}
	}
	this.addArrows();
	this.nextTurn();
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
	var board = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	board.setAttribute('id', 'board');
	var width = this.width * TILE_SIZE;
	var height = this.height * TILE_SIZE;
	board.setAttribute('width', width);
	board.setAttribute('height', height);
	container.appendChild(board);
	this.topology.addEdges(container, width, height);
};

game.addArrows = function () {
	var x;
	var y;
	var arrows = this.svg.getElementById('arrows');
	clearNode(arrows);
	for (x = 0; x < this.width; x++) {
		var north = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		north.setAttribute('x', (x + 0.5) * TILE_SIZE);
		north.setAttribute('y', 0);
		north.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-north');
		north.addEventListener('click', this.onArrowClick.bind(this, Direction.NORTH, x));
		north.addEventListener('mouseover', this.onArrowOver.bind(this, Direction.NORTH, x));
		north.addEventListener('mouseout', this.onArrowOut.bind(this, Direction.NORTH, x));
		arrows.appendChild(north);
	}
	for (x = 0; x < this.width; x++) {
		var south = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		south.setAttribute('x', (x + 0.5) * TILE_SIZE);
		south.setAttribute('y', this.height * TILE_SIZE);
		south.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-south');
		south.addEventListener('click', this.onArrowClick.bind(this, Direction.SOUTH, x));
		south.addEventListener('mouseover', this.onArrowOver.bind(this, Direction.SOUTH, x));
		south.addEventListener('mouseout', this.onArrowOut.bind(this, Direction.SOUTH, x));
		arrows.appendChild(south);
	}
	for (y = 0; y < this.height; y++) {
		var west = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		west.setAttribute('x', 0);
		west.setAttribute('y', (y + 0.5) * TILE_SIZE);
		west.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-west');
		west.addEventListener('click', this.onArrowClick.bind(this, Direction.WEST, y));
		west.addEventListener('mouseover', this.onArrowOver.bind(this, Direction.WEST, y));
		west.addEventListener('mouseout', this.onArrowOut.bind(this, Direction.WEST, y));
		arrows.appendChild(west);
	}
	for (y = 0; y < this.height; y++) {
		var east = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		east.setAttribute('x', this.width * TILE_SIZE);
		east.setAttribute('y', (y + 0.5) * TILE_SIZE);
		east.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-east');
		east.addEventListener('click', this.onArrowClick.bind(this, Direction.EAST, y));
		east.addEventListener('mouseover', this.onArrowOver.bind(this, Direction.EAST, y));
		east.addEventListener('mouseout', this.onArrowOut.bind(this, Direction.EAST, y));
		arrows.appendChild(east);
	}
};

game.addTile = function (x, y) {
	var tile = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	tile.setAttribute('x', x * TILE_SIZE);
	tile.setAttribute('y', y * TILE_SIZE);
	tile.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#tile');
	this.svg.getElementById('tiles').appendChild(tile);
	return tile;
};

game.addToken = function (x, y, player) {
	// check (player == 1 or 2) and this.tiles[x][y] === 0
	this.tiles[x][y] = player;
	var container = this.svg.getElementById('tiles');
	var token = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	token.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#token-player' + player.toString());
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
		ghost.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#token-player' + player.toString());
		ghost.setAttribute('x', x * TILE_SIZE);
		ghost.setAttribute('y', y * TILE_SIZE);
	}
};

// event listeners
game.onArrowClick = function (direction, offset, e) {
	console.log('CLICK', Direction.names[direction], offset, e, this);
	var target = this.getArrowTarget(direction, offset);
	// assert target not null
	game.addToken(target[0], target[1], this.player);
	game.nextTurn();
};

game.onArrowOver = function (direction, offset, e) {
	console.log('OVER', Direction.names[direction], offset, e, this);
	var target = this.getArrowTarget(direction, offset);
	this.moveGhostToken(target[0], target[1], this.player);
};

game.onArrowOut = function (direction, offset, e) {
	console.log('OUT', Direction.names[direction], offset, e, this);
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
}

game.nextTurn = function () {
	this.togglePlayer();
	var available = this.getAvailableArrows();
	var arrows = this.svg.getElementById('arrows');
	for (var i = 0; i < available.length; i++) {
		arrows.childNodes[i].setAttribute(
			'class', available[i] ? 'available' : '');
	}
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
