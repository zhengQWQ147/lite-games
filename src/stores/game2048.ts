//手势移动方向
export enum MoveType {
  up = 0,
  down = 1,
  left = 2,
  right = 3,
}

//基础可移动元素（带数字）
class Cell {
  level: number = 0
  location: { x: number; y: number }
  constructor(level: number, x: number, y: number) {
    this.level = level
    this.location = { x: x, y: y }
  }
}
//游戏底层元素类型
enum BackgroundCellType {
  Default = 0, // 无特殊样式
  DarkHoll = 1, // 黑洞，不计算当前格子的分数
  Double = 2, // 翻倍，双倍计算当前格子的分数
  Error = 3, // 错误，如果一个元素2个回合都在error上，将随机改变cell的level
}
//游戏底层元素（加成）
class BackgroundCell {
  type: BackgroundCellType = BackgroundCellType.Default
  location: { x: number; y: number }
  constructor(x: number, y: number) {
    this.location = { x: x, y: y }
  }
}

//游戏窗口
export class GameWin {
  row: number = 5
  col: number = 5
  valueUp: Cell[][]
  valueUpCnt: number
  valueDown: BackgroundCell[][]

  //游戏栈，用于撤回
  historyStack: [Cell[][], BackgroundCell[][], move: MoveType][] = []

  constructor() {
    this.valueUp = Array.from({ length: this.row }, (_, r) =>
      Array.from({ length: this.col }, (_, c) => new Cell(0, r, c)),
    )
    this.valueUpCnt = 0
    this.valueDown = Array.from({ length: this.row }, (_, row) =>
      Array.from({ length: this.col }, (_, col) => new BackgroundCell(row, col)),
    )
    this.createNum()
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
      structuredClone(this.valueUp),
      structuredClone(this.valueDown),
      moveTyle,
    ])
    if (this.historyStack.length > 20) this.historyStack.shift()

    switch (moveTyle) {
      case MoveType.up: {
        for (let c = 0; c < this.col; c++) {
          const levels: number[] = []
          for (let r = 0; r < this.row; r++) {
            if (this.valueUp[r]![c]!.level > 0) levels.push(this.valueUp[r]![c]!.level)
          }
          const merged: number[] = []
          for (let i = 0; i < levels.length; i++) {
            if (i + 1 < levels.length && levels[i]! === levels[i + 1]!) {
              merged.push(levels[i]! + 1)
              i++
            } else {
              merged.push(levels[i]!)
            }
          }
          for (let r = 0; r < this.row; r++) {
            this.valueUp[r]![c]!.level = merged[r] ?? 0
          }
        }
        break
      }
      case MoveType.down: {
        for (let c = 0; c < this.col; c++) {
          const levels: number[] = []
          for (let r = this.row - 1; r >= 0; r--) {
            if (this.valueUp[r]![c]!.level > 0) levels.push(this.valueUp[r]![c]!.level)
          }
          const merged: number[] = []
          for (let i = 0; i < levels.length; i++) {
            if (i + 1 < levels.length && levels[i]! === levels[i + 1]!) {
              merged.push(levels[i]! + 1)
              i++
            } else {
              merged.push(levels[i]!)
            }
          }
          for (let r = 0; r < this.row; r++) {
            this.valueUp[this.row - 1 - r]![c]!.level = merged[r] ?? 0
          }
        }
        break
      }
      case MoveType.left: {
        for (let r = 0; r < this.row; r++) {
          const levels: number[] = []
          for (let c = 0; c < this.col; c++) {
            if (this.valueUp[r]![c]!.level > 0) levels.push(this.valueUp[r]![c]!.level)
          }
          const merged: number[] = []
          for (let i = 0; i < levels.length; i++) {
            if (i + 1 < levels.length && levels[i]! === levels[i + 1]!) {
              merged.push(levels[i]! + 1)
              i++
            } else {
              merged.push(levels[i]!)
            }
          }
          for (let c = 0; c < this.col; c++) {
            this.valueUp[r]![c]!.level = merged[c] ?? 0
          }
        }
        break
      }
      case MoveType.right: {
        for (let r = 0; r < this.row; r++) {
          const levels: number[] = []
          for (let c = this.col - 1; c >= 0; c--) {
            if (this.valueUp[r]![c]!.level > 0) levels.push(this.valueUp[r]![c]!.level)
          }
          const merged: number[] = []
          for (let i = 0; i < levels.length; i++) {
            if (i + 1 < levels.length && levels[i]! === levels[i + 1]!) {
              merged.push(levels[i]! + 1)
              i++
            } else {
              merged.push(levels[i]!)
            }
          }
          for (let c = 0; c < this.col; c++) {
            this.valueUp[r]![this.col - 1 - c]!.level = merged[c] ?? 0
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
  }

  //撤回函数
  rollbackMove() {
    if (this.historyStack.length <= 0) return
    const buff = this.historyStack.pop()!
    this.valueUp = buff[0]
    this.valueDown = buff[1]
    //buff[2]用于动画
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
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)]!
    this.valueUp[r]![c]!.level = Math.random() < 0.9 ? 1 : 2
  }
}
