let w = window.innerWidth * (80 / 100) > 850 ? 850 : window.innerWidth * (80 / 100);
let h = window.innerHeight * (80 / 100) > 850 ? 850 : window.innerHeight * (80 / 100);
if (w < h) {
    h = w
} else {
    w = h
}

export let variables = {
    GRID_CELL_SIZE_w: h / 17,
    GRID_CELL_SIZE_h: h / 17,

}
//17
//15