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
  RubbishCage = 3, // 垃圾桶，碰到元素消失，暂时不实现

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
      // case BackgroundCellType.RubbishCage: {
      //   return -1
      // }
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
  valueUp!: Cell[][]
  valueUpCnt!: number
  valueDown!: BackgroundCell[][]
  score: number = 0

  //游戏栈，用于撤回
  historyStack: [Cell[][], BackgroundCell[][], move: MoveType][] = []

  //动画标记
  newCells: boolean[][] = []
  mergeCells: boolean[][] = []

  //历史最高分
  highScore: number = 0

  constructor(row?: number, col?: number) {
    this.loadHighScore()
    if (row) this.row = row
    if (col) this.col = col
    this.initGrid()
  }

  private initGrid() {
    this.valueUp = Array.from({ length: this.row }, (_, r) =>
      Array.from({ length: this.col }, (_, c) => new Cell(0, r, c, 0)),
    )
    this.valueUpCnt = 0
    this.valueDown = Array.from({ length: this.row }, (_, row) =>
      Array.from({ length: this.col }, (_, col) => new BackgroundCell(row, col)),
    )
    this.score = 0
    this.moveTimes = 0
    this.historyStack = []
    this.resetAnimFlags()
    this.createNum()
  }

  //新游戏
  resetGame() {
    localStorage.removeItem('game2048_save')
    nextTileId = 1
    this.initGrid()
    this.saveGame()
  }

  loadHighScore() {
    const raw = localStorage.getItem('game2048_highscore')
    this.highScore = raw ? parseInt(raw, 10) : 0
  }

  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem('game2048_highscore', String(this.highScore))
    }
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
    // 移动前深拷贝快照
    const snapshot: [Cell[][], BackgroundCell[][], MoveType] = [
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
    ]

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

    //十步刷新底层元素
    if (this.moveTimes++ > 10) {
      this.upDateValueDown()
      this.moveTimes = 0
    }

    // 无实际变化则不记录
    let changed = false
    for (let r = 0; r < this.row && !changed; r++)
      for (let c = 0; c < this.col && !changed; c++)
        if (snapshot[0]![r]![c]!.level !== this.valueUp[r]![c]!.level) changed = true

    if (!changed) {
      this.moveTimes--
      return
    }

    this.historyStack.push(snapshot)
    if (this.historyStack.length > 20) this.historyStack.shift()

    // 更新计数，生成新数字
    this.valueUpCnt = 0
    for (let r = 0; r < this.row; r++)
      for (let c = 0; c < this.col; c++) if (this.valueUp[r]![c]!.level > 0) this.valueUpCnt++
    this.createNum()
    this.scoreCnt()
    this.saveGame()
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
    this.saveGame()
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
          // if (this.valueDown[i]![j]!.scoreMultiple() === -1) {
          //   this.valueUp[i]![j]!.level = 0
          //   continue
          // }
          this.score +=
            Math.pow(2, this.valueUp[i]![j]!.level) * this.valueDown[i]![j]!.scoreMultiple()
        }
      }
    this.updateHighScore()
  }

  //更新底层元素
  upDateValueDown() {
    // 全体格子坐标
    const allPos = Array.from({ length: this.row }, (_, r) =>
      Array.from({ length: this.col }, (_, c) => ({ r, c })),
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

  //#region 本地存档
  saveGame(): void {
    const data = {
      row: this.row,
      col: this.col,
      valueUp: this.valueUp.map((row) =>
        row.map((cell) => ({
          level: cell.level,
          tileId: cell.tileId,
          x: cell.location.x,
          y: cell.location.y,
        })),
      ),
      valueDown: this.valueDown.map((row) =>
        row.map((bg) => ({ type: bg.type, x: bg.location.x, y: bg.location.y })),
      ),
      valueUpCnt: this.valueUpCnt,
      score: this.score,
      moveTimes: this.moveTimes,
      historyStack: this.historyStack.map((entry) => ({
        valueUp: entry[0].map((row) =>
          row.map((cell) => ({
            level: cell.level,
            tileId: cell.tileId,
            x: cell.location.x,
            y: cell.location.y,
          })),
        ),
        valueDown: entry[1].map((row) =>
          row.map((bg) => ({ type: bg.type, x: bg.location.x, y: bg.location.y })),
        ),
        moveTyle: entry[2],
      })),
      nextTileId,
    }
    localStorage.setItem('game2048_save', JSON.stringify(data))
  }

  /** 从 localStorage 恢复存档，返回是否成功 */
  loadGame(): boolean {
    const raw = localStorage.getItem('game2048_save')
    if (!raw) return false
    try {
      const d = JSON.parse(raw)
      ;((this.row = d.row), (this.col = d.col))
      this.valueUp = d.valueUp.map((row: any) =>
        row.map((cell: any) => new Cell(cell.level, cell.x, cell.y, cell.tileId)),
      )
      this.valueDown = d.valueDown.map((row: any) =>
        row.map((bg: any) => new BackgroundCell(bg.x, bg.y, bg.type)),
      )
      this.valueUpCnt = d.valueUpCnt
      this.score = d.score
      this.moveTimes = d.moveTimes ?? 0
      this.historyStack = (d.historyStack || []).map((entry: any) => [
        entry.valueUp.map((row: any[]) =>
          row.map((cell: any) => new Cell(cell.level, cell.x, cell.y, cell.tileId)),
        ),
        entry.valueDown.map((row: any[]) =>
          row.map((bg: any) => new BackgroundCell(bg.x, bg.y, bg.type)),
        ),
        entry.moveTyle,
      ])
      nextTileId = d.nextTileId ?? 1
      this.resetAnimFlags()
      return true
    } catch {
      return false
    }
  }
  //#endregion
}
