import { _decorator, Animation, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Loading")
export class Loading extends Component {
  @property(Node)
  bar: Node = new Node();

  public barAnimation: Animation = new Animation();
  public isPlaying: boolean = true;

  start() {
    this.barAnimation = this.bar.getComponent(Animation);
    this.barAnimation.play();
  }

  update() {
    this.isPlaying = this.barAnimation.getState("loadingBarAnim").isPlaying;
  }
}
