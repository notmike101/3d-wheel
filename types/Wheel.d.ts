export interface WheelInterface {
  isSpinning: boolean;

  updateWheelItems(wheelItem: string[]);
  getCurrentWinner(): number;
  spin(): Promise<string>;
}

export interface WheelPhysics {
  rotationSpeed: number;
  rotationAcceleration: number;
  friction: number;
  rotation: number;
}
