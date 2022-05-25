interface WheelInterface {
  updateWheelItems(wheelItem: string[]): void;
  getCurrentWinner(): number;
  spin(): Promise<string | void>;
}

interface WheelPhysics {
  rotationSpeed: number;
  rotationAcceleration: number;
  friction: number;
  rotation: number;
}
