import {
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

  wildIndex = this.itemSpritePathArray.length - 1;

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
    this.resultArray = this.layoutArray.map((layout) =>
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
  }

  spawnItems(layout: Node, count: number) {
    let indexArray = [];

    for (let i = 0; i < count; i++) {
      let index = this.getRandomNumber(0, this.itemSpritePathArray.length - 1);

      let item = this.spawnItem(this.itemSpritePathArray[index]);

      layout.insertChild(item, 0);
      indexArray.push(index);
    }

    return indexArray;
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
    resources.load(this.itemFramePathArray[0], SpriteFrame, (err, asset) => {
      item.children[1].getComponent(Sprite).spriteFrame = asset;

      item.children[1].getComponent(UITransform).width = this.symbolWidth;
      item.children[1].getComponent(UITransform).height = this.symbolHeight;
    });

    resources.load(
      this.itemFrameBackPathArray[1],
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

  // 롤리이 끝나고 결과 로직
  rollingEnd() {
    const PAY_LINES = [
      // Line 1
      [1, 1, 1, 1, 1],
      // Line 2
      [2, 2, 2, 2, 2],
      // Line 3
      [0, 0, 0, 0, 0],
      // Line 4
      [2, 1, 0, 1, 2],
      // Line 5
      [0, 1, 2, 1, 0],
      // Line 6
      [1, 2, 1, 2, 1],
      // Line 7
      [1, 0, 1, 0, 1],
      // Line 8
      [2, 2, 1, 0, 0],
      // Line 9
      [0, 0, 1, 2, 2],
      // Line 10
      [1, 0, 1, 2, 1],
      // Line 11
      [1, 2, 1, 0, 1],
      // Line 12
      [2, 1, 1, 1, 2],
      // Line 13
      [0, 1, 1, 1, 0],
      // Line 14
      [2, 1, 2, 1, 2],
      // Line 15
      [0, 1, 0, 1, 0],
      // Line 16
      [1, 1, 2, 1, 1],
      // Line 17
      [1, 1, 0, 1, 1],
      // Line 18
      [2, 2, 0, 2, 2],
      // Line 19
      [0, 0, 2, 0, 0],
      // Line 20
      [2, 0, 0, 0, 2],
    ];

    const matchLines = [];

    for (let i = 0; i < 3; i++) {
      const key = this.resultArray[0][i];

      for (let j = 0; j < PAY_LINES.length; j++) {
        const payLine = PAY_LINES[j];

        // payline과 비교해서 맞는지 여부
        const tempArray: number[] = [];

        for (let k = 0; k < this.resultArray.length; k++) {
          if (
            key === this.resultArray[k][payLine[k]] ||
            this.wildIndex === this.resultArray[k][payLine[k]]
          ) {
            tempArray.push(payLine[k]);
          } else break;
        }

        if (tempArray.length > 2) {
          console.log(key + 1, j + 1, tempArray);
          this.lines.children[j].active = true;

          matchLines.push(tempArray);
        }
      }
    }

    console.log(matchLines);
    // const item = this.layoutArray[0].children[0];
  }

  onSpinClicked() {
    if (this.isRolling) {
      return;
    }

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
}
