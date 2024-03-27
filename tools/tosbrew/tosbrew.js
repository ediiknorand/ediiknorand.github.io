/* Made by [Silute]Knorand */

const MODE_START = 0;
const MODE_GOAL = 1;
const MODE_WALL = 2;

const CELL_PLAIN = 0;
const CELL_START = 1;
const CELL_GOAL = 2;
const CELL_WALL = 3;

const CELL_LABEL = {
  [CELL_PLAIN]: '·',
  [CELL_START]: 'S',
  [CELL_GOAL]: '?',
  [CELL_WALL]: 'X'
}

const CELL_NAME = {
  [CELL_PLAIN]: 'plain',
  [CELL_START]: 'start',
  [CELL_GOAL]: 'goal',
  [CELL_WALL]: 'wall'
};

const CELLS_SIZE = 18+18*19 + 1;
var cells = new Array(CELLS_SIZE).fill(CELL_PLAIN);

const UP = 'u';
const DOWN = 'd';
const LEFT = 'l';
const RIGHT = 'r';

const MATERIALS = {
  '4r1u': 'Crimson Bloodstone - D4W1',
  '4r1d': 'Amber Bloodstone - D4S1',
  '4l1u': 'Rustmoss Seastone - A4W1',
  '4l1d': 'Cerulean Seastone - A4S1',
  '1l4d': 'Ironstone Shard - A1S4',
  '1r4d': 'Yellow Chitin - D1S4',
  '1l4u': 'Purple Chitin - A1W4',
  '1r4u': 'Blue Chitin - D1W4',
  '4r2u': 'Zelkova Leaves - D4W2',
  '4r2d': 'Bamboo Cane - D4S2',
  '4l2u': 'Red Mitella Flower - A4W2',
  '4l2d': 'Millenium Forest Twig - A4S2',
  '2l4d': 'Myriad Forest Twig - A2S4',
  '2r4d': 'Twilight Bud - D2S4',
  '2l4u': 'Crow Lake Grillagrass - A2W4',
  '2r4u': 'Wide-Leaf Wasprout - D2W4'
}

/* Fill logic */

var fillmode = MODE_START;
var startindex = 9 + 9*19;

function switch_mode(mode)
{
  fillmode = mode;
}

function set_cell(index, type)
{
  const grid = document.getElementById('grid').children;
  let cell = grid[index];
  cell.innerHTML = CELL_LABEL[type];
  cell.classList.remove('cell-plain');
  cell.classList.remove('cell-start');
  cell.classList.remove('cell-goal');
  cell.classList.remove('cell-wall');
  cell.classList.add('cell-' + CELL_NAME[type]);
  cells[index] = type;
}

function populate_grid()
{
  const grid = document.getElementById('grid');

  for(let i = 0; i < cells.length; i++) {
    let cell = document.createElement('button');
    cell.innerHTML = CELL_LABEL[cells[i]];
    cell.onclick = () => CellClick(i);
    grid.appendChild(cell);
    cell.classList.add('cell');
    cell.classList.add('cell-plain');
  }

  set_cell(startindex, CELL_START);
}

function set_start(index)
{
  if(cells[index] != CELL_PLAIN)
    return;
  set_cell(startindex, CELL_PLAIN);
  set_cell(index, CELL_START);
  startindex = index;
}

function set_goal(index)
{
  if(cells[index] == CELL_GOAL) {
    set_cell(index, CELL_PLAIN);
    return;
  }
  if(cells[index] != CELL_PLAIN)
    return;
  set_cell(index, CELL_GOAL);
}

function set_wall(index)
{
  if(cells[index] == CELL_WALL) {
    set_cell(index, CELL_PLAIN);
    return;
  }
  if(cells[index] != CELL_PLAIN)
    return;
  set_cell(index, CELL_WALL);
}

function CellClick(index)
{
  switch(fillmode) {
  case MODE_START:
    set_start(index);
    break;
  case MODE_GOAL:
    set_goal(index);
    break;
  case MODE_WALL:
    set_wall(index);
    break;
  }
}

function disable_grid(value)
{
  const grid = document.getElementById('grid').children;
  for(let i = 0; i < grid.length; i++) {
    grid[i].disabled = value;
  }
}

/* Shortest path */
function get_movements(material)
{
  var movements = [];
  for(let i = 0; i < material.length/2; i++) {
    let steps = parseInt(material[2*i]);
    let direction = material[2*i+1];
    movements.push({'steps': steps, 'direction': direction});
  }
  return movements;
}

function out_of_bounds(x, y)
{
  return x < 0 || x >= 19 || y < 0 || y >= 19;
}

function get_position(index, movement)
{
  let x = index % 19;
  let y = Math.floor(index/19);
  for(let step = 0; step < movement.steps; step++) {
    switch(movement.direction) {
    case UP: y--; break;
    case DOWN: y++; break;
    case LEFT: x--; break;
    case RIGHT: x++; break;
    }
    if(out_of_bounds(x, y) || cells[x + y*19] == CELL_WALL)
      return -1;
  }
  return x + y*19;
}

function walk(index, movements)
{
  var cur = index;
  for(let i = 0; i < movements.length; i++) {
    cur = get_position(cur, movements[i]);
    if(cur < 0) return -1;
  }
  return cur;
}

function get_neighbors(index)
{
  var neighbors = [];

  Object.keys(MATERIALS).forEach(function(material) {
    const movements = get_movements(material);
    var dest = walk(index, movements);
    if(dest < 0) return;
    neighbors.push({index: dest, material: material});
  });

  return neighbors;
}

function shortest_path(start, end)
{
  var previous = {};

  var Q = new PriorityQueue((a,b) => a.distance < b.distance);
  Q.push({index: start, distance: 0, material: null, previous: null});

  while(Q.size() > 0) {
    let v = Q.pop();
    if(v.index in previous) continue;
    previous[v.index] = {index: v.previous, material: v.material};

    if(v.index == end) {
      let path = [];
      let cur = v.index;
      while(cur != start) {
        path.push({index: cur, material: previous[cur].material});
        cur = previous[cur].index;
      }
      path.reverse();
      return {path: path, distance: v.distance};
    }

    let neighbors = get_neighbors(v.index);
    for(let i = 0; i < neighbors.length; i++) {
      let u = neighbors[i];
      if(!(u.index in previous)) {
        Q.push({
          index: u.index,
          distance: v.distance + 1,
          previous: v.index,
          material: u.material});
      }
    }
  }
  return null;
}

/* Minimum length hamiltonian path in a digraph */
function make_path_table(goals)
{
  let path_table = {};
  path_table[startindex] = {};
  for(let i = 0; i < goals.length; i++) {
    path_table[goals[i]] = {};
    path_table[goals[i]][startindex] = {path: null, distance: 0};
    let path = shortest_path(startindex, goals[i]);
    path_table[startindex][goals[i]]=path?path:{path:null,distance:9999};
  }
  for(let i = 0; i < goals.length; i++) {
    for(let j = 0; j < goals.length; j++) {
      if(i == j) continue;
      let path = shortest_path(goals[i], goals[j]);
      path_table[goals[i]][goals[j]]=path?path:{path:null,distance:9999};
      path = shortest_path(goals[j], goals[i]);
      path_table[goals[j]][goals[i]]=path?path:{path:null,distance:9999};
    }
  }
  return path_table;
}

function make_subset_key(subset)
{
  let key = new Array(Math.ceil(CELLS_SIZE/8)).fill(0);
  for(let i = 0; i < subset.length; i++) {
    key[Math.floor(subset[i]/8)] |= (1 << (subset[i] % 8));
  }
  for(let i = 0; i < key.length; i++) {
    key[i] = String.fromCharCode(key[i]);
  }
  return key.join('');
}

function split_subset(subset, k)
{
  let s = subset.slice();
  let [r] = s.splice(k, 1);
  return {index: r, subset: s};
}

function* iter_subsets(set, size)
{
  if(set.length <= size) yield set;
  else
    for(let i = 0; i < set.length; i++) {
      let split = split_subset(set, i);
      for(let s of iter_subsets(split.subset, size))
        yield s;
    }
}

function reconstruct_tsp_path(g, subset)
{
  if(subset.length == 0) return [];
  let min = -1;
  let v = -1;
  let key = make_subset_key(subset);
  Object.keys(g[key]).forEach(function(index) {
    let dist = g[key][index];
    if(min < 0 || dist < min) {
      min = dist;
      v = parseInt(index);
    }
  });
  let k = subset.indexOf(v);
  let split = split_subset(subset, k);
  return reconstruct_tsp_path(g, split.subset).concat([v]);
}

function solve_tsp(goals)
{
  let path_table = make_path_table(goals);
  let g = {};

  for(let i = 0; i < goals.length; i++) {
    let key = make_subset_key([goals[i]]);
    g[key] = {}
    g[key][goals[i]] = path_table[startindex][goals[i]].distance;
  }

  for(let size = 2; size <= goals.length; size++) {
    for(let subset of iter_subsets(goals, size)) {
      let key = make_subset_key(subset);
      if(g[key]) continue;
      g[key] = {};

      for(let k = 0; k < subset.length; k++) {
        let split = split_subset(subset, k);
        let key2 = make_subset_key(split.subset);
        let min = -1;
        for(let m = 0; m < split.subset.length; m++) {

          let dist = path_table[split.subset[m]][split.index].distance;
          if(min < 0 || g[key2][split.subset[m]] + dist < min)
            min = g[key2][split.subset[m]] + dist;
        }
        g[key][split.index] = min;
      }

    }
  }
  let tsp_path = [startindex].concat(reconstruct_tsp_path(g, goals));
  let path = [];
  for(let k = 1; k < tsp_path.length; k++) {
    let t = path_table[tsp_path[k-1]][tsp_path[k]];
    if(t.distance >= 9999) break; // unreachable
    path = path.concat(t.path?t.path:[]);
  }
  return {path: path, distance: path.length};
}

function get_goals()
{
  let goals = [];
  for(let i = 0; i < cells.length; i++) {
    if(cells[i] == CELL_GOAL)
      goals.push(i);
  }
  return goals;
}

function disable_editing(value)
{
  let run = document.getElementById('run');
  run.disabled = value;
  disable_grid(value);

  document.getElementById('radio_start').disabled = value;
  document.getElementById('radio_goal').disabled = value;
  document.getElementById('radio_wall').disabled = value;
}

function PopulateSolution()
{
  disable_editing(true);

  let goals = get_goals();
  let path = solve_tsp(goals).path;

  let solution = document.getElementById('solution');
  for(let i = 0; i < path.length; i++) {
    let mat = document.createElement('li');
    mat.innerHTML = MATERIALS[path[i].material];
    solution.appendChild(mat);
    mat.classList.add('material');
  }
}

function ClearSolution()
{
  document.getElementById('solution').innerHTML = '';
  document.getElementById('grid').innerHTML = '';

  cells.fill(CELL_PLAIN);
  startindex = 9 + 9*19;

  disable_editing(false);
  populate_grid();
}

/* Initialize */
populate_grid();
