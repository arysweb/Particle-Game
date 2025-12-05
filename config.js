// Global configuration for the game
// As the project grows, keep all reusable constants here.

window.GAME_CONFIG = {
  WORLD_SIZE: 4000,
  GRID: {
    CELL_SIZE: 30,
    LINE_COLOR: '#c0c0c0',
    LINE_ALPHA: 0.25
  },
  CAMERA: {
    INITIAL_ZOOM: 1.6,
    MIN_ZOOM: 0.7,
    ZOOM_STEP: 0.06,
    ZOOM_TWEEN_RATE: 12,
    FOODS_PER_ZOOM_STEP: 20
  },
  PLAYER: {
    RADIUS: 36,
    BASE_SPEED: 300,
    COLORS: ['#ff0000', '#00ff00', '#0000ff'],
    MASS_PER_FOOD: 10,
    SPEED_EXP: 0.5,
    RADIUS_TWEEN_RATE: 10,
    FOODS_PER_STEP: 15,
    RADIUS_STEP_FRAC: 0.009
  },
  FOOD: {
    RADIUS: 12,
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
