export interface MotionIntent {
  desiredVelocity:[number,number,number];
  desiredFacing:[number,number,number];
  acceleration:[number,number,number];
  stance:'stand'|'crouch'|'prone';
  action:'none'|'aim'|'reload'|'vault'|'brace'|'dodge';
  effort:number;
}

export interface PredictedContact { limb:string; position:[number,number,number]; normal:[number,number,number]; timeToContact:number; }
