import { _decorator, Button, Component, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PanelSpins")
export class PanelSpins extends Component {
  @property(Button)
  btnPlus: Button;
  @property(Button)
  btnMinus: Button;
  @property(Label)
  lblSpins: Label;

  spins = 20;

  onClickPlus() {
    this.spins = Math.min(40, this.spins + 1);

    this.lblSpins.string = this.spins + "";
  }
  onClickMinus() {
    this.spins = Math.max(0, this.spins - 1);

    this.lblSpins.string = this.spins + "";
  }
}
