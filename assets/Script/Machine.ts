import {
  Animation,
  AudioClip,
  AudioSource,
  Component,
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

  resultArray: number[][] = [];
  layoutArray: Node[] = [];
  // 애니메이션 동작한 데이터, 한번에 해제하기위해서
  animatedItemArray: Node[] = [];
  // 결과 애니메이션 타이머, 스핀 누르면 초기화됨
  resultAnimTimer: number;

  leftReels = [4, 2, 20, 16, 10, 1, 11, 17, 3, 5];

  wildIndex = this.itemSpritePathArray.length - 1;

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

    // 1. 1열에 있는 아이템을 키로 잡는다.
    // 2. 모든 PayLine 패턴을 확인한다.
    // 3. PayLine과 일치한 갯수를 valueArray에 저장한다.
    // 4. matchLines에 저장하여 반복하여 애니메이션 재생
    // 5. Wild는 모든 심볼을 통용한다.
    for (let i = 0; i < 3; i++) {
      const key = this.resultArray[0][i];

      if (key === this.wildIndex) break;

      for (let j = 0; j < PAY_LINES.length; j++) {
        const payLine = PAY_LINES[j];

        const valueArray: number[] = [];

        for (let k = 0; k < this.resultArray.length; k++) {
          // 비교할 심볼
          const target = this.resultArray[k][payLine[k]];

          if (key === target || this.wildIndex === target) {
            valueArray.push(payLine[k]);
          } else break;
        }

        if (valueArray.length > 2) {
          matchLines.push({ key, line: j, value: valueArray });
        }
      }
    }

    console.log(matchLines);

    for (let i = 0; i < matchLines.length; i++) {
      this.setItemsAnimation();
      this.setLinesActive();

      const target = matchLines[i];

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

      const reward = this.rewardArray[target.key][target.value.length - 1];

      console.log(reward * 10000);

      await this.delay(3000);
    }
  }

  onSpinClicked() {
    if (this.isRolling) {
      return;
    }

    clearInterval(this.resultAnimTimer);

    this.isRolling = true;

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

  delay(ms = 0) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(1);
      }, ms);
    });
  }
}
