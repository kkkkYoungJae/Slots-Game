import { _decorator, Component } from "cc";
import { Loading } from "./Loading";
import { Machine } from "./Machine";
const { ccclass, property } = _decorator;

@ccclass("GameCtrl")
export class GameCtrl extends Component {
  @property(Loading)
  loading: Loading;

  @property(Machine)
  machine: Machine;

  start() {}

  update() {
    if (!this.loading.isPlaying) {
      this.loading.node.active = false;
    }
  }
}
