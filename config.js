// Global configuration for the game
// As the project grows, keep all reusable constants here.

window.GAME_CONFIG = {
  WORLD_SIZE: 4000,
  GRID: {
    CELL_SIZE: 50,
    LINE_COLOR: '#c0c0c0',
    LINE_ALPHA: 0.25
  },
  PLAYER: {
    RADIUS: 32,
    BASE_SPEED: 450,
    COLORS: ['#ff0000', '#00ff00', '#0000ff']
  },
  FOOD: {
    RADIUS: 16,
    INITIAL_COUNT: 500,
    MIN_DISTANCE_FROM_PLAYER: 50,
    COLORS: ['#ff0000', '#00ff00', '#0000ff']
  },
  VIRUS: {
    RADIUS: 70,
    INITIAL_COUNT: 20,
    IMAGE: 'assets/img/virus.svg',
    ROTATION_SPEED: 0.5
  }
};
