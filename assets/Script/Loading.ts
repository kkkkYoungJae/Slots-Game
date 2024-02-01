import { _decorator, Animation, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Loading")
export class Loading extends Component {
  @property(Node)
  bar: Node = new Node();

  start() {
    const anim = this.bar.getComponent(Animation);

    anim.play();

    // @ts-ignore
    anim.on("finished", () => (this.node.active = false), this);
  }
}
