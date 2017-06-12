const TILE_SIZE = 100;
const BORDER_SIZE = 20;
// document.getElementById('tile').getAttribute('width')

var Array2D = function (width, height) {
	var grid = new Array(width);
	for (var i = 0; i < width; i++) {
		grid[i] = new Array(height);
	}
	return grid;
};

var topologies;

var clearNode = function (node) {
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
};

var game = {
	svg: null,
	tiles: null,
	width: null,
	height: null,
	topology: null,
	player: 0,
	playerColors: ['', '#ffbfbf', '#cfdef7']
};

game.new = function (options) {
	this.topology = topologies[options['topology']];
	this.width = options['width'];
	this.height = options['height'];
	this.tiles = Array2D(this.width, this.height);
	this.player = 0;
	this.setupSVG();
	this.drawBoard();
	this.drawArrows();
	for (var x = 0; x < this.width; x++) {
		for (var y = 0; y < this.height; y++) {
			this.tiles[x][y] = 0;
			var tile = this.drawTile(x, y);
			tile.addEventListener('click', this.onTileClick);
		}
	}
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

game.drawBoard = function () {
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
	this.topology.drawEdges(container, width, height);
};

game.drawArrows = function () {
	var arrows = this.svg.getElementById('arrows');
	clearNode(arrows);
	for (var x = 0; x < this.width; x++) {
		var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		arrow.setAttribute('x', (x + 0.5) * TILE_SIZE);
		arrow.setAttribute('y', 0);
		arrow.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-north');
		arrows.appendChild(arrow);
		arrow = arrow.cloneNode();
		arrow.setAttribute('y', this.height * TILE_SIZE);
		arrow.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-south');
		arrows.appendChild(arrow);
	}
	for (var y = 0; y < this.height; y++) {
		arrow = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		arrow.setAttribute('x', 0);
		arrow.setAttribute('y', (y + 0.5) * TILE_SIZE);
		arrow.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-west');
		arrows.appendChild(arrow);
		arrow = arrow.cloneNode();
		arrow.setAttribute('x', this.width * TILE_SIZE);
		arrow.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#arrow-east');
		arrows.appendChild(arrow);
	}
};

game.drawTile = function (x, y) {
	var tile = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	tile.setAttribute('x', x * TILE_SIZE);
	tile.setAttribute('y', y * TILE_SIZE);
	tile.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#tile');
	this.svg.getElementById('tiles').appendChild(tile);
	return tile;
};

game.onTileClick = function (e) {
	console.info(e, this);
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
