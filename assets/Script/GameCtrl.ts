import { _decorator, Component } from "cc";
import { Info } from "./Info";
import { Loading } from "./Loading";
import { Machine } from "./Machine";
const { ccclass, property } = _decorator;

@ccclass("GameCtrl")
export class GameCtrl extends Component {
  @property(Machine)
  machine: Machine;
  @property(Info)
  info: Info;
  @property(Loading)
  loading: Loading;

  onLoad() {
    this.loading.node.active = true;
    this.machine.node.active = true;
    this.info.node.active = false;
  }

  showMachine() {
    this.loading.node.active = false;
    this.machine.node.active = true;
    this.info.node.active = false;
  }

  showInfo() {
    this.loading.node.active = false;
    this.machine.node.active = false;
    this.info.node.active = true;
  }

  update() {}
}
