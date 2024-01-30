import {
  AudioClip,
  AudioSource,
  Component,
  Node,
  NodePool,
  Prefab,
  Quat,
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
  @property(Node)
  handle: Node = new Node();

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
  lastResultArray: number[][] = [];
  layoutArray: Node[] = [];

  start() {
    this.audioSource = this.node.getComponent(AudioSource);

    this.itemSpritePathArray.forEach((spritePath) => {
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
    // // Layout 위치 재설정
    this.setLayoutsPosition();

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

    // 현재 결과값을 이전결과값으로 저장
    this.lastResultArray = this.resultArray;
  }

  // 모든 레이아웃 포지션 설정
  setLayoutsPosition({
    x = 0,
    y = -(this.horizontalLines * (this.symbolHeight / 2)),
    z = 0,
  } = {}) {
    this.layoutArray.map((layout) => layout.setPosition(x, y, z));
  }

  spawnItems(layout: Node, count: number, lastResultArray?: number[]) {
    let indexArray = [];

    for (let i = 0; i < count; i++) {
      let index = this.getRandomNumber(0, this.itemSpritePathArray.length - 1);
      let item = this.spawnItem(
        lastResultArray
          ? this.itemSpritePathArray[lastResultArray[i]]
          : this.itemSpritePathArray[index]
      );

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
      item.getComponent(Sprite).spriteFrame = asset;

      item.getComponent(UITransform).width = this.symbolWidth;
      item.getComponent(UITransform).height = this.symbolHeight;
    });

    return item;
  }

  getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 로그 출력하면 숫자로만 나오는데 한글로 출력
  loggingResultKor() {
    const fruits = [
      "사과",
      "바나나",
      "오렌지",
      "복숭아",
      "감",
      "강아지",
      "돼지",
      "토끼",
      "양",
      "불가사리",
    ];

    console.log(
      this.resultArray.map((row, wi) =>
        row.map((num, i) => `${i + 1}행 ${wi + 1}열 ${fruits[num]}`)
      )
    );
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
    // this.loggingResultKor();
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
      [2, 2, 1, 2, 2],
      // Line 7
      [0, 0, 1, 0, 0],
      // Line 8
      [1, 0, 0, 0, 1],
      // Line 9
      [1, 2, 2, 2, 1],
      // Line 10
      [2, 1, 1, 1, 2],
      // Line 11
      [0, 1, 1, 1, 0],
      // Line 12
      [2, 1, 2, 1, 2],
      // Line 13
      [0, 1, 0, 1, 0],
      // Line 14
      [1, 2, 1, 2, 1],
      // Line 15
      [1, 0, 1, 0, 1],
      // Line 16
      [1, 1, 2, 1, 1],
      // Line 17
      [1, 1, 0, 1, 1],
      // Line 18
      [2, 0, 2, 0, 2],
      // Line 19
      [0, 2, 0, 2, 0],
      // Line 20
      [1, 2, 0, 2, 1],
      // Line 21
      [1, 0, 2, 0, 1],
      // Line 22
      [2, 2, 0, 2, 2],
      // Line 23
      [0, 0, 2, 0, 0],
      // Line 24
      [2, 0, 0, 0, 2],
      // Line 25
      [0, 2, 2, 2, 0],
      // Line 26
      [2, 1, 0, 0, 0],
      // Line 27
      [0, 1, 2, 2, 2],
      // Line 28
      [2, 1, 1, 1, 0],
      // Line 29
      [2, 2, 1, 0, 0],
      // Line 30
      [0, 0, 1, 2, 2],
    ];

    console.log(this.resultArray);

    for (let i = 0; i < this.horizontalLines; i++) {
      console.log(this.resultArray[0][i]);
    }
  }

  onHandleClicked() {
    if (this.isRolling) {
      return;
    }

    this.isRolling = true;

    this.audioSource.playOneShot(this.handleAudio, 1.5);

    tween(this.handle)
      .to(0.5, { rotation: Quat.fromEuler(new Quat(), -50, 0, 0) })
      .to(0.5, { rotation: Quat.fromEuler(new Quat(), 0, 0, 0) })
      .start();

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
