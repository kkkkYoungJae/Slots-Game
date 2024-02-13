import {
  Animation,
  AudioClip,
  AudioSource,
  Button,
  Component,
  Label,
  Node,
  NodePool,
  Prefab,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec3,
  _decorator,
  instantiate,
  resources,
  tween,
} from "cc";
import { PanelSpins } from "./PanelSpins";
const { ccclass, property } = _decorator;

@ccclass("Machine")
export class Machine extends Component {
  @property(Prefab)
  item: Prefab = new Prefab();
  itemNodePool: NodePool = new NodePool();
  itemSpritePathArray = [
    "Symbols/Symbol1/spriteFrame",
    "Symbols/Symbol2/spriteFrame",
    "Symbols/Symbol3/spriteFrame",
    "Symbols/Symbol4/spriteFrame",
    "Symbols/Symbol5/spriteFrame",
    "Symbols/Symbol6/spriteFrame",
    "Symbols/Symbol7/spriteFrame",
    "Symbols/Symbol8/spriteFrame",
    "Symbols/Symbol9/spriteFrame",
    "Symbols/Symbol10/spriteFrame",
    "Symbols/Symbol11/spriteFrame",
    "Symbols/Symbol12/spriteFrame",
    "Symbols/Symbol13/spriteFrame",
  ];
  itemFramePathArray = [
    "Frames/Frame01/spriteFrame",
    "Frames/Frame02/spriteFrame",
    "Frames/Frame03/spriteFrame",
    "Frames/Frame04/spriteFrame",
    "Frames/Frame05/spriteFrame",
    "Frames/Frame06/spriteFrame",
    "Frames/Frame07/spriteFrame",
    "Frames/Frame08/spriteFrame",
    "Frames/Frame09/spriteFrame",
    "Frames/Frame10/spriteFrame",
    "Frames/Frame11/spriteFrame",
    "Frames/Frame12/spriteFrame",
    "Frames/Frame13/spriteFrame",
    "Frames/Frame14/spriteFrame",
    "Frames/Frame15/spriteFrame",
    "Frames/Frame16/spriteFrame",
    "Frames/Frame17/spriteFrame",
    "Frames/Frame18/spriteFrame",
    "Frames/Frame19/spriteFrame",
    "Frames/Frame20/spriteFrame",
  ];
  itemFrameBackPathArray = [
    "Frames/FrameBack/spriteFrame",
    "Frames/FrameBack2/spriteFrame",
  ];

  @property(Node)
  windowLayout1: Node = new Node();
  @property(Node)
  windowLayout2: Node = new Node();
  @property(Node)
  windowLayout3: Node = new Node();
  @property(Node)
  windowLayout4: Node = new Node();
  @property(Node)
  windowLayout5: Node = new Node();
  @property(Node)
  lines: Node = new Node();
  @property(Node)
  reels: Node;
  @property(Node)
  win: Node;

  @property(Label)
  lblPanelLines: Label;
  @property(Label)
  lblPanelLineBet: Label;
  @property(Label)
  lblPanelTotalBet: Label;
  @property(Label)
  lblWin: Label;
  @property(Label)
  lblBalance: Label;

  @property(Button)
  btnLines: Button;
  @property(Button)
  btnBetPerLine: Button;
  @property(Button)
  btnBetMax: Button;
  @property(Button)
  btnSpin: Button;
  @property(Button)
  btnAutoStart: Button;

  @property(PanelSpins)
  panelSpins: PanelSpins;

  audioSource: AudioSource = null!;
  @property(AudioClip)
  handleAudio: AudioClip = new AudioClip();
  @property(AudioClip)
  rollingAudio: AudioClip = new AudioClip();

  num1 = 30;
  num2 = 60;
  num3 = 90;
  num4 = 120;
  num5 = 150;

  symbolWidth = 250;
  symbolHeight = 250;

  horizontalLines = 3;

  isFirstRoll = true;
  isRolling = false;
  isAutoRolling = false;

  resultArray: number[][] = [];
  layoutArray: Node[] = [];
  // 애니메이션 동작한 데이터, 한번에 해제하기위해서
  animatedItemArray: Node[] = [];
  // 결과 애니메이션 타이머, 스핀 누르면 초기화됨
  resultAnimTimer: number;

  creditsBalance: number = 0;

  panelLines = 20;
  panelLineBetArray = [
    200, 400, 1000, 2000, 4000, 10000, 20000, 40000, 100000, 200000, 400000,
    1000000, 2000000,
  ];
  panelLineBetIndex = 0;

  leftReels = [4, 2, 20, 16, 10, 1, 11, 17, 3, 5];

  wildIndex = this.itemSpritePathArray.length - 1;
  bonusIndex = this.itemSpritePathArray.length - 2;

  rewardArray = [
    // 9, 10
    [0, 0, 5, 20, 100],
    [0, 0, 5, 20, 100],
    // J, Q
    [0, 0, 7, 25, 150],
    [0, 0, 7, 25, 150],
    // A, K
    [0, 0, 10, 30, 200],
    [0, 0, 10, 30, 200],
    // 하프, 스페이드
    [0, 0, 15, 75, 500],
    [0, 0, 15, 75, 500],
    // 다이아
    [0, 5, 50, 100, 1000],
    // 왕관
    [0, 5, 100, 250, 2500],
    // 럭키세븐
    [0, 10, 150, 500, 5000],
    // 보너스
    [0, 0, 3, 10, 100],
    // 와일드
    [0, 15, 200, 1000, 5000],
  ];

  start() {
    this.changeCreditsBalance(50000000);

    this.audioSource = this.node.getComponent(AudioSource);

    this.itemSpritePathArray.forEach((spritePath) => {
      resources.preload(spritePath, SpriteFrame);
    });

    this.itemFramePathArray.forEach((spritePath) => {
      resources.preload(spritePath, SpriteFrame);
    });

    this.itemFrameBackPathArray.forEach((spritePath) => {
      resources.preload(spritePath, SpriteFrame);
    });

    this.layoutArray = [
      this.windowLayout1,
      this.windowLayout2,
      this.windowLayout3,
      this.windowLayout4,
      this.windowLayout5,
    ];

    this.setWindowLayoutContent();
  }

  setWindowLayoutContent() {
    // Layout 위치 재설정
    this.setLayoutsPosition();

    // Line Active 재설정
    this.setLinesActive();

    // Item Animation 재설정
    this.setItemsAnimation();

    // Label Win 초기화
    this.lblWin.string = "0";

    // 롤링할 아이템 갯수설정 +- 5개
    this.num1 = this.getRandomNumber(this.num1 - 5, this.num1 + 5);
    this.num2 = this.getRandomNumber(this.num2 - 5, this.num2 + 5);
    this.num3 = this.getRandomNumber(this.num3 - 5, this.num3 + 5);
    this.num4 = this.getRandomNumber(this.num4 - 5, this.num4 + 5);
    this.num5 = this.getRandomNumber(this.num5 - 5, this.num5 + 5);

    // 각 창에 롤링될 그림을 무작위로 추가합니다. (오디오의 길이에 따라 조절됩니다)
    const nums = [this.num1, this.num2, this.num3, this.num4, this.num5];
    this.layoutArray.map((layout, i) => this.spawnItems(layout, nums[i]));

    // 결과를 추가하고 resultArray에 저장합니다
    // 추후에 결과값 비교할때 사용
    this.resultArray = this.layoutArray.map((layout, i) =>
      this.spawnItems(layout, this.horizontalLines)
    );

    // 2번쨰 롤링부터는 이전에 했던 결과값이 남아져있어서 이전 결과 행 갯수를 더해줘야함
    if (!this.isFirstRoll) {
      this.num1 += this.horizontalLines;
      this.num2 += this.horizontalLines;
      this.num3 += this.horizontalLines;
      this.num4 += this.horizontalLines;
      this.num5 += this.horizontalLines;
    }
  }

  // 모든 레이아웃 포지션 설정
  setLayoutsPosition({
    x = 0,
    y = -(this.horizontalLines * (this.symbolHeight / 2)),
    z = 0,
  } = {}) {
    this.layoutArray.map((layout) => layout.setPosition(x, y, z));
  }

  setLinesActive() {
    this.lines.children.map((line) => (line.active = false));
    this.lines.setSiblingIndex(0);
  }

  setItemsAnimation() {
    this.animatedItemArray.map((item) => {
      item.children[0].getComponent(Sprite).spriteFrame = null;
      item.children[1].getComponent(Sprite).spriteFrame = null;
      item.children[2].getComponent(Animation).stop();
    });
    this.animatedItemArray = [];
  }

  spawnItems(layout: Node, count: number) {
    let indexArray = [];

    for (let i = 0; i < count; i++) {
      let index = this.getRandomNumber(0, this.itemSpritePathArray.length - 1);

      let item = this.spawnItem(this.itemSpritePathArray[index]);

      layout.insertChild(item, 0);
      indexArray.push(index);
    }

    return indexArray.reverse();
  }

  spawnItem(spritePath: string) {
    let item = null!;

    if (this.itemNodePool.size() > 0) {
      item = this.itemNodePool.get();
    } else {
      item = instantiate(this.item);
    }

    resources.load(spritePath, SpriteFrame, (err, asset) => {
      item.children[2].getComponent(Sprite).spriteFrame = asset;

      item.getComponent(UITransform).width = this.symbolWidth;
      item.getComponent(UITransform).height = this.symbolHeight;
    });

    return item;
  }

  spawnItemFrame(item: Node, payLine: number) {
    resources.load(
      this.itemFramePathArray[payLine],
      SpriteFrame,
      (err, asset) => {
        item.children[1].getComponent(Sprite).spriteFrame = asset;

        item.children[1].getComponent(UITransform).width = this.symbolWidth;
        item.children[1].getComponent(UITransform).height = this.symbolHeight;
      }
    );

    resources.load(
      this.itemFrameBackPathArray[this.leftReels.indexOf(payLine) ? 1 : 0],
      SpriteFrame,
      (err, asset) => {
        item.children[0].getComponent(Sprite).spriteFrame = asset;

        item.children[0].getComponent(UITransform).width = this.symbolWidth;
        item.children[0].getComponent(UITransform).height = this.symbolHeight;
      }
    );
  }

  getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 이미 롤링된 (화면상에 보이지 않는) Node 해제
  removeUnusedNodes() {
    this.layoutArray.map((layout) => {
      while (layout.children.length > this.horizontalLines) {
        this.itemNodePool.put(layout.children[layout.children.length - 1]);
      }
    });
  }

  // 롤링이 끝나고 결과 로직
  async rollingEnd() {
    const PAY_LINES = [
      //Line 1
      [1, 1, 1, 1, 1],
      //Line 2
      [0, 0, 0, 0, 0],
      //Line 3
      [2, 2, 2, 2, 2],
      //Line 4
      [0, 1, 2, 1, 0],
      //Line 5
      [2, 1, 0, 1, 2],
      //Line 6
      [1, 0, 1, 0, 1],
      //Line 7
      [1, 2, 1, 2, 1],
      //Line 8
      [0, 0, 1, 2, 2],
      //Line 9
      [2, 2, 1, 0, 0],
      //Line 10
      [1, 2, 1, 0, 1],
      //Line 11
      [1, 0, 1, 2, 1],
      //Line 12
      [0, 1, 1, 1, 0],
      //Line 13
      [2, 1, 1, 1, 2],
      //Line 14
      [0, 1, 0, 1, 0],
      //Line 15
      [2, 1, 2, 1, 2],
      //Line 16
      [1, 1, 0, 1, 1],
      //Line 17
      [1, 1, 2, 1, 1],
      //Line 18
      [0, 0, 2, 0, 0],
      //Line 19
      [2, 2, 0, 2, 2],
      //Line 20
      [0, 2, 2, 2, 0],
    ];

    const matchLines: { key: number; line: number; value: number[] }[] = [];
    const rewards: number[] = [];

    // 1. 1열에 있는 아이템을 키로 잡는다.
    // 2. 모든 PayLine 패턴을 확인한다.
    // 3. PayLine과 일치한 갯수를 valueArray에 저장한다.
    // 4. matchLines에 저장하여 반복하여 애니메이션 재생
    // 5. Wild는 보너스 심볼을 제외한 모든 심볼을 통용한다.
    for (let i = 0; i < 3; i++) {
      // 비교할 심볼의 실제 번호
      const key = this.resultArray[0][i];

      for (let j = 0; j < PAY_LINES.length; j++) {
        // [0,1,2,1,2] 형태
        const payLine = PAY_LINES[j];
        const valueArray: number[] = [i];

        for (let k = 1; k < this.resultArray.length; k++) {
          // 비교될 심볼의 실제 번호
          const target = this.resultArray[k][payLine[k]];
          const isFirstMatch = valueArray[0] === payLine[0];
          const isKeyMatchBonus = this.bonusIndex === key;
          const isTargetMatchWild = this.wildIndex === target;

          // 0번은 기본으로 넣어놓고 1번부터 비교해서 아래 조건문이 필요함
          if (
            isFirstMatch &&
            (key === target || (isTargetMatchWild && !isKeyMatchBonus))
          ) {
            valueArray.push(payLine[k]);
          } else break;
        }

        // 승리조건이 2개인것도 있고 3개이상인것도 있음
        const reward = this.rewardArray[key][valueArray.length - 1];

        if (valueArray.length > 1 && reward > 0) {
          matchLines.push({ key, line: j, value: valueArray });
          rewards.push(reward * this.panelLineBetArray[this.panelLineBetIndex]);
        }
      }
    }

    console.log(matchLines);
    console.log(rewards);

    const totalReward = rewards.reduce((acc, current) => acc + current, 0);
    this.lblWin.string = totalReward.toLocaleString();
    this.changeCreditsBalance(totalReward);

    const withBonus = matchLines.find((child) => child.key === 11);

    if (withBonus) {
      this.bonusStage();
    }

    if (this.isAutoRolling && matchLines.length > 0) {
      const maxIndex = this.findIndexOfMaxValue(rewards);
      this.playResultAnim(matchLines[maxIndex]);
    } else {
      if (matchLines.length > 0) {
        this.playResultAnim(matchLines[0]);
      }

      let index = 1;
      if (matchLines.length > 1) {
        this.resultAnimTimer = setInterval(() => {
          this.playResultAnim(matchLines[index % matchLines.length]);
          index += 1;
        }, 3000);
      }
    }

    if (this.panelSpins.spins > 0 && this.isAutoRolling) {
      await this.delay(matchLines.length > 0 ? 3000 : 1000);
      this.onSpinClicked();
    } else {
      this.changeBtnInteractable(true);
      this.isAutoRolling = false;
    }
  }

  async bonusStage() {
    console.log("bonus");
    this.win.active = true;
    await this.delay(3000);
    this.win.active = false;
  }

  playResultAnim(target) {
    if (!this.isAutoRolling) {
      this.setItemsAnimation();
      this.setLinesActive();
    }

    for (let j = 0; j < target.value.length; j++) {
      const symbolIndex = this.resultArray[j][target.value[j]];
      const item = this.layoutArray[j].children[target.value[j]];

      const anim = item.children[2].getComponent(Animation);
      anim.play(anim.clips[symbolIndex].name);

      this.spawnItemFrame(item, target.line);

      this.animatedItemArray.push(item);
    }

    // 맞는 갯수에 맞춰 zIndex 조정
    this.lines.setSiblingIndex(
      this.resultArray.length + 1 - target.value.length
    );

    this.lines.children[target.line].active = true;
  }

  changeBtnInteractable(bool: boolean) {
    this.btnLines.interactable = bool;
    this.btnBetMax.interactable = bool;
    this.btnBetPerLine.interactable = bool;
    this.btnSpin.interactable = bool;
    this.btnAutoStart.interactable = bool;
    this.panelSpins.btnMinus.interactable = bool;
    this.panelSpins.btnPlus.interactable = bool;
  }

  changeCreditsBalance(balance: number) {
    this.creditsBalance += balance;
    this.lblBalance.string = this.creditsBalance.toLocaleString();
  }

  onSpinClicked() {
    if (this.isRolling || (this.isAutoRolling && this.panelSpins.spins === 0))
      return;

    if (
      this.creditsBalance -
        this.panelLines * this.panelLineBetArray[this.panelLineBetIndex] <
      0
    ) {
      this.changeBtnInteractable(true);
      this.isAutoRolling = false;
      return;
    }

    this.isRolling = true;

    if (this.isAutoRolling) this.panelSpins.onClickMinus();

    this.changeCreditsBalance(
      -(this.panelLines * this.panelLineBetArray[this.panelLineBetIndex])
    );

    this.changeBtnInteractable(false);

    clearInterval(this.resultAnimTimer);

    this.audioSource.playOneShot(this.handleAudio, 1.5);

    if (this.isFirstRoll) {
      this.isFirstRoll = false;
    } else {
      this.setWindowLayoutContent();
    }

    this.audioSource.playOneShot(this.rollingAudio);

    tween(this.windowLayout1)
      .by(
        1,
        { position: new Vec3(0, -this.num1 * this.symbolHeight, 0) },
        { easing: "sineInOut" }
      )
      .start();

    tween(this.windowLayout2)
      .by(
        1.25,
        { position: new Vec3(0, -this.num2 * this.symbolHeight, 0) },
        { easing: "sineInOut" }
      )
      .start();

    tween(this.windowLayout3)
      .by(
        1.5,
        { position: new Vec3(0, -this.num3 * this.symbolHeight, 0) },
        { easing: "sineInOut" }
      )
      .start();

    tween(this.windowLayout4)
      .by(
        1.75,
        { position: new Vec3(0, -this.num4 * this.symbolHeight, 0) },
        { easing: "sineInOut" }
      )
      .start();

    tween(this.windowLayout5)
      .by(
        2,
        { position: new Vec3(0, -this.num5 * this.symbolHeight, 0) },
        { easing: "sineInOut" }
      )
      .call(() => {
        this.isRolling = false;

        this.rollingEnd();

        this.removeUnusedNodes();

        this.setLayoutsPosition();
      })
      .start();
  }

  onClickAutoStart() {
    if (this.panelSpins.spins > 0) {
      this.isAutoRolling = true;
      this.onSpinClicked();
    }
  }

  onClickLines() {
    if (this.panelLines < 20) {
      this.panelLines += 1;
    } else {
      this.panelLines = 10;
    }

    this.lblPanelLines.string = this.panelLines + "";

    for (let i = 1; i < 21; i++) {
      this.reels.children[i].getComponent(Button).interactable =
        this.panelLines >= i;
    }

    this.lblPanelTotalBet.string = (
      this.panelLines * this.panelLineBetArray[this.panelLineBetIndex]
    ).toLocaleString();
  }

  onClickBetPerLine() {
    if (this.panelLineBetIndex < this.panelLineBetArray.length - 1) {
      this.panelLineBetIndex += 1;
    } else {
      this.panelLineBetIndex = 0;
    }

    this.lblPanelLineBet.string =
      this.panelLineBetArray[this.panelLineBetIndex].toLocaleString();

    this.lblPanelTotalBet.string = (
      this.panelLines * this.panelLineBetArray[this.panelLineBetIndex]
    ).toLocaleString();
  }

  onClickBetMax() {
    this.panelLineBetIndex = this.panelLineBetArray.length - 1;

    this.lblPanelLineBet.string =
      this.panelLineBetArray[this.panelLineBetIndex].toLocaleString();

    this.lblPanelTotalBet.string = (
      this.panelLines * this.panelLineBetArray[this.panelLineBetIndex]
    ).toLocaleString();
  }

  delay(ms = 0) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(1);
      }, ms);
    });
  }

  findIndexOfMaxValue(array: number[]) {
    if (array.length === 0) {
      return -1;
    }
    let maxValue = Math.max(...array);
    return array.lastIndexOf(maxValue);
  }
}
