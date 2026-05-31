//手势移动方向
export enum MoveType {
  up = 0,
  down = 1,
  left = 2,
  right = 3,
}

let nextTileId = 1

//基础可移动元素（带数字）
class Cell {
  level: number = 0
  location: { x: number; y: number }
  tileId: number = 0
  constructor(level: number, x: number, y: number, tileId?: number) {
    this.level = level
    this.location = { x: x, y: y }
    this.tileId = tileId ?? 0
  }
}
//游戏底层元素类型
enum BackgroundCellType {
  Default = 0, // 无特殊样式
  DarkHoll = 1, // 黑洞，不计算当前格子的分数
  Double = 2, // 翻倍，双倍计算当前格子的分数
  Error = 3, // 错误，如果一个元素2个回合都在error上，将随机改变cell的level

  Len = 3, //可选长度
}
//游戏底层元素（加成）
class BackgroundCell {
  type: BackgroundCellType
  location: { x: number; y: number }
  constructor(x: number, y: number, type: BackgroundCellType = BackgroundCellType.Default) {
    this.location = { x: x, y: y }
    this.type = type
  }

  //计算当前格子的倍率
  scoreMultiple(): number {
    switch (this.type) {
      case BackgroundCellType.Default: {
        return 1
      }
      case BackgroundCellType.DarkHoll: {
        return 0
      }
      case BackgroundCellType.Double: {
        return 2
      }
      default: {
        return 1
      }
    }
  }
}

//游戏窗口
export class GameWin {
  //移动步数
  moveTimes: number = 0

  row: number = 5
  col: number = 5
  valueUp: Cell[][]
  valueUpCnt: number
  valueDown: BackgroundCell[][]
  score: number = 0

  //游戏栈，用于撤回
  historyStack: [Cell[][], BackgroundCell[][], move: MoveType][] = []

  //动画标记
  newCells: boolean[][] = []
  mergeCells: boolean[][] = []

  constructor(row?: number, col?: number) {
    if (row) this.row = row
    if (col) this.col = col
    this.valueUp = Array.from({ length: this.row }, (_, r) =>
      Array.from({ length: this.col }, (_, c) => new Cell(0, r, c, 0)),
    )
    this.valueUpCnt = 0
    this.valueDown = Array.from({ length: this.row }, (_, row) =>
      Array.from({ length: this.col }, (_, col) => new BackgroundCell(row, col)),
    )
    this.resetAnimFlags()
    this.createNum()
  }

  resetAnimFlags() {
    this.newCells = Array.from({ length: this.row }, () => Array(this.col).fill(false))
    this.mergeCells = Array.from({ length: this.row }, () => Array(this.col).fill(false))
  }

  //尝试增加cell1和cell2，不能合并返回-1
  add(cell1: Cell, cell2: Cell): number {
    if (cell1.level === cell2.level) {
      return cell1.level + 1
    }
    return -1
  }

  //处理移动
  move(moveTyle: MoveType): void {
    //入栈，历史记录，用于撤回
    this.historyStack.push([
      this.valueUp.map((row) =>
        row.map((cell) => new Cell(cell.level, cell.location.x, cell.location.y, cell.tileId)),
      ),
      this.valueDown.map((row) =>
        row.map((bg) => {
          const c = new BackgroundCell(bg.location.x, bg.location.y)
          c.type = bg.type
          return c
        }),
      ),
      moveTyle,
    ])
    if (this.historyStack.length > 20) this.historyStack.shift()

    // 保存旧状态，清空动画标记
    this.resetAnimFlags()

    switch (moveTyle) {
      case MoveType.up: {
        for (let c = 0; c < this.col; c++) {
          const levels: number[] = []
          const ids: number[] = []
          for (let r = 0; r < this.row; r++) {
            if (this.valueUp[r]![c]!.level > 0) {
              levels.push(this.valueUp[r]![c]!.level)
              ids.push(this.valueUp[r]![c]!.tileId)
            }
          }
          const mergedLv: number[] = []
          const mergedId: number[] = []
          for (let i = 0; i < levels.length; i++) {
            if (i + 1 < levels.length && levels[i]! === levels[i + 1]!) {
              mergedLv.push(levels[i]! + 1)
              mergedId.push(ids[i]!)
              this.mergeCells[levels.indexOf(levels[i]!)]![c] = true
              i++
            } else {
              mergedLv.push(levels[i]!)
              mergedId.push(ids[i]!)
            }
          }
          for (let r = 0; r < this.row; r++) {
            this.valueUp[r]![c]!.level = mergedLv[r] ?? 0
            this.valueUp[r]![c]!.tileId = mergedId[r] ?? 0
          }
        }
        break
      }
      case MoveType.down: {
        for (let c = 0; c < this.col; c++) {
          const levels: number[] = []
          const ids: number[] = []
          for (let r = this.row - 1; r >= 0; r--) {
            if (this.valueUp[r]![c]!.level > 0) {
              levels.push(this.valueUp[r]![c]!.level)
              ids.push(this.valueUp[r]![c]!.tileId)
            }
          }
          const mergedLv: number[] = []
          const mergedId: number[] = []
          for (let i = 0; i < levels.length; i++) {
            if (i + 1 < levels.length && levels[i]! === levels[i + 1]!) {
              mergedLv.push(levels[i]! + 1)
              mergedId.push(ids[i]!)
              // locate the actual grid row of the surviving tile
              for (let r = this.row - 1; r >= 0; r--) {
                if (this.valueUp[r]![c]!.tileId === ids[i]) {
                  this.mergeCells[r]![c] = true
                  break
                }
              }
              i++
            } else {
              mergedLv.push(levels[i]!)
              mergedId.push(ids[i]!)
            }
          }
          for (let r = 0; r < this.row; r++) {
            this.valueUp[this.row - 1 - r]![c]!.level = mergedLv[r] ?? 0
            this.valueUp[this.row - 1 - r]![c]!.tileId = mergedId[r] ?? 0
          }
        }
        break
      }
      case MoveType.left: {
        for (let r = 0; r < this.row; r++) {
          const levels: number[] = []
          const ids: number[] = []
          for (let c = 0; c < this.col; c++) {
            if (this.valueUp[r]![c]!.level > 0) {
              levels.push(this.valueUp[r]![c]!.level)
              ids.push(this.valueUp[r]![c]!.tileId)
            }
          }
          const mergedLv: number[] = []
          const mergedId: number[] = []
          for (let i = 0; i < levels.length; i++) {
            if (i + 1 < levels.length && levels[i]! === levels[i + 1]!) {
              mergedLv.push(levels[i]! + 1)
              mergedId.push(ids[i]!)
              this.mergeCells[r]![levels.indexOf(levels[i]!)] = true
              i++
            } else {
              mergedLv.push(levels[i]!)
              mergedId.push(ids[i]!)
            }
          }
          for (let c = 0; c < this.col; c++) {
            this.valueUp[r]![c]!.level = mergedLv[c] ?? 0
            this.valueUp[r]![c]!.tileId = mergedId[c] ?? 0
          }
        }
        break
      }
      case MoveType.right: {
        for (let r = 0; r < this.row; r++) {
          const levels: number[] = []
          const ids: number[] = []
          for (let c = this.col - 1; c >= 0; c--) {
            if (this.valueUp[r]![c]!.level > 0) {
              levels.push(this.valueUp[r]![c]!.level)
              ids.push(this.valueUp[r]![c]!.tileId)
            }
          }
          const mergedLv: number[] = []
          const mergedId: number[] = []
          for (let i = 0; i < levels.length; i++) {
            if (i + 1 < levels.length && levels[i]! === levels[i + 1]!) {
              mergedLv.push(levels[i]! + 1)
              mergedId.push(ids[i]!)
              // locate the actual grid column of the surviving tile
              for (let c = this.col - 1; c >= 0; c--) {
                if (this.valueUp[r]![c]!.tileId === ids[i]) {
                  this.mergeCells[r]![c] = true
                  break
                }
              }
              i++
            } else {
              mergedLv.push(levels[i]!)
              mergedId.push(ids[i]!)
            }
          }
          for (let c = 0; c < this.col; c++) {
            this.valueUp[r]![this.col - 1 - c]!.level = mergedLv[c] ?? 0
            this.valueUp[r]![this.col - 1 - c]!.tileId = mergedId[c] ?? 0
          }
        }
        break
      }
    }

    // 更新计数，生成新数字
    this.valueUpCnt = 0
    for (let r = 0; r < this.row; r++)
      for (let c = 0; c < this.col; c++) if (this.valueUp[r]![c]!.level > 0) this.valueUpCnt++
    this.createNum()

    this.scoreCnt()

    //十步刷新底层元素
    if (this.moveTimes++ > 10) {
      this.upDateValueDown()
      this.moveTimes = 0
    }
  }

  //撤回函数
  rollbackMove() {
    if (this.historyStack.length <= 0) return
    const buff = this.historyStack.pop()!
    this.valueUp = buff[0]
    this.valueDown = buff[1]
    //buff[2]用于动画
    this.resetAnimFlags()
    this.scoreCnt()
    this.moveTimes--
  }

  //生成数字
  createNum() {
    const emptyCells: { r: number; c: number }[] = []
    for (let r = 0; r < this.row; r++) {
      for (let c = 0; c < this.col; c++) {
        if (this.valueUp[r]![c]!.level === 0) emptyCells.push({ r, c })
      }
    }
    if (emptyCells.length === 0) return
    for (let i = 0; i < 2 && emptyCells.length > 0; i++) {
      const idx = Math.floor(Math.random() * emptyCells.length)
      const { r, c } = emptyCells[idx]!
      emptyCells.splice(idx, 1)
      this.valueUp[r]![c]!.level = Math.random() < 0.9 ? 1 : 2
      this.valueUp[r]![c]!.tileId = nextTileId++
      this.newCells[r]![c] = true
    }
  }

  //计算分数
  scoreCnt() {
    this.score = 0
    for (let i = 0; i < this.row; i++)
      for (let j = 0; j < this.col; j++) {
        if (this.valueUp[i]![j]!.level !== 0) {
          this.score +=
            Math.pow(2, this.valueUp[i]![j]!.level) * this.valueDown[i]![j]!.scoreMultiple()
        }
      }
  }

  //更新底层元素
  upDateValueDown() {
    // 全体格子坐标
    const allPos = Array.from({ length: this.row }, (_, r) =>
      Array.from({ length: this.col }, (_, c) => ({ r, c }))
    ).flat()
    // 随机选 3 个不同位置
    const picked = allPos.sort(() => Math.random() - 0.5).slice(0, BackgroundCellType.Len)
    this.valueDown = Array.from({ length: this.row }, (_, row) =>
      Array.from({ length: this.col }, (_, col) => {
        const idx = picked.findIndex((p) => p.r === row && p.c === col)
        if (idx >= 0) return new BackgroundCell(row, col, idx + 1)
        return new BackgroundCell(row, col)
      }),
    )
  }
}
