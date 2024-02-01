import {
  _decorator,
  Button,
  Component,
  resources,
  Sprite,
  SpriteFrame,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Info")
export class Info extends Component {
  @property(Button)
  btnLeft: Button = new Button();
  @property(Button)
  btnRight: Button = new Button();

  currentPage: number = 0;

  infoSpritePathArray = [
    "Info/info1/spriteFrame",
    "Info/info2/spriteFrame",
    "Info/info3/spriteFrame",
  ];

  start() {
    this.infoSpritePathArray.forEach((spritePath) => {
      resources.preload(spritePath, SpriteFrame);
    });
  }

  onLeftClicked() {
    this.currentPage = Math.max(0, this.currentPage - 1);
  }

  onRightClicked() {
    this.currentPage = Math.min(2, this.currentPage + 1);
  }

  loadInfoSprite(index = 0) {
    resources.load(
      this.infoSpritePathArray[index],
      SpriteFrame,
      (err, asset) => {
        this.node.getComponent(Sprite).spriteFrame = asset;
      }
    );
  }

  onDisable() {
    this.currentPage = 0;

    this.loadInfoSprite(0);
  }

  update() {
    this.btnLeft.interactable = this.currentPage !== 0;
    this.btnRight.interactable = this.currentPage !== 2;

    this.loadInfoSprite(this.currentPage);
  }
}
