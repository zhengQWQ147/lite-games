/** 格子样式类型 — 用于控制 UI 高亮 */
export enum CellStyle {
  Default = 0, // 无特殊样式
  Selected = 1, // 当前选中的格子
  Related = 2, // 与选中格子同行/列/宫的关联格子
  Error = 3, // 填写与题目冲突
}

/** 数独中的一个格子 */
export class Cell {
  /** 格内数字，0 表示空格 */
  value: number
  /** 是否为预置题目（题目格子不可编辑） */
  isClue: boolean
  readonly row: number
  readonly col: number
  style: CellStyle = CellStyle.Default

  constructor(value: number, row: number, col: number, isClue = false) {
    this.value = value
    this.row = row
    this.col = col
    this.isClue = isClue
  }

  /** 是否允许用户修改（空格可填，预置题目不可改） */
  get editable(): boolean {
    return !this.isClue
  }

  select() {
    this.style = CellStyle.Selected
  }

  deselect() {
    this.style = CellStyle.Default
  }
}

export class Board {
  readonly cells: Cell[][]

  constructor() {
    this.cells = Array.from({ length: 9 }, (_, row) =>
      Array.from({ length: 9 }, (_, col) => new Cell(0, row, col, false)),
    )
  }

  /** Fisher-Yates 洗牌 */
  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = array[i]!
      array[i] = array[j]!
      array[j] = temp
    }
    return array
  }

  /** 检查在 (row, col) 放置 num 是否符合数独规则 */
  ifValid(row: number, col: number, num: number): boolean {
    // 检查行
    for (let c = 0; c < 9; c++) {
      if (this.cells[row]![c]!.value === num) return false
    }
    // 检查列
    for (let r = 0; r < 9; r++) {
      if (this.cells[r]![col]!.value === num) return false
    }
    // 检查 3x3 宫格
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (this.cells[r]![c]!.value === num) return false
      }
    }
    return true
  }

  /** 回溯法填充数独（随机顺序） */
  private fillBacktrack(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.cells[row]![col]!.value === 0) {
          const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
          for (const num of nums) {
            if (this.ifValid(row, col, num)) {
              this.cells[row]![col]!.value = num
              if (this.fillBacktrack()) return true
              this.cells[row]![col]!.value = 0 // 回溯
            }
          }
          return false // 当前格子无可用数字
        }
      }
    }
    return true // 全部填满
  }

  /** 生成一个完整数独 */
  newGame() {
    // 清空棋盘
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        this.cells[row]![col]!.value = 0
      }
    }
    this.fillBacktrack()
    this.digHoles()
  }

  /** 判断当前棋盘是否有解 */
  hasSolution(): boolean {
    const board: number[][] = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => this.cells[r]![c]!.value),
    )
    const result = this.solve(board)
    console.log('hasSolution debug:', {
      result,
      boardData: board.map(r => r.join(',')),
      cellSample: this.cells[0]!.map(c => c.value)
    })
    return result
  }

  /** 完整解答（用于提示、验算） */
  readonly solution: number[][] = []

  /** 将当前格子值保存为解答 */
  private saveSolution() {
    this.solution.length = 0
    for (let row = 0; row < 9; row++) {
      this.solution[row] = []
      for (let col = 0; col < 9; col++) {
        this.solution[row]![col] = this.cells[row]![col]!.value
      }
    }
  }

  /** 检查数字在二维数组棋盘上是否合法 */
  private isValidOnBoard(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row]![i] === num) return false
      if (board[i]![col] === num) return false
    }
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (board[r]![c] === num) return false
      }
    }
    return true
  }

  /** 回溯求解，找到第一个解即返回 true */
  private solve(board: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row]![col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValidOnBoard(board, row, col, num)) {
              board[row]![col] = num
              if (this.solve(board)) return true
              board[row]![col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  /** 计算 board 的解个数（最多数到 2） */
  private countSolutions(board: number[][]): number {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row]![col] === 0) {
          let count = 0
          for (let num = 1; num <= 9; num++) {
            if (this.isValidOnBoard(board, row, col, num)) {
              board[row]![col] = num
              count += this.countSolutions(board)
              board[row]![col] = 0
              if (count >= 2) return count
            }
          }
          return count
        }
      }
    }
    return 1
  }

  /** 挖空出题 */
  private digHoles() {
    this.saveSolution()

    // 将当前格子值复制到临时数组
    const board: number[][] = Array.from({ length: 9 }, (_, row) =>
      Array.from({ length: 9 }, (_, col) => this.cells[row]![col]!.value),
    )

    // 收集所有位置并随机打乱
    const positions: [number, number][] = []
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) positions.push([r, c])
    this.shuffle(positions)

    let toRemove = 81 - 35 // 默认中等难度，保留 35 个提示数
    for (const [r, c] of positions) {
      if (toRemove <= 0) break
      const backup = board[r]![c]!
      board[r]![c] = 0
      // 必须深拷贝，countSolutions 会修改 board
      if (this.countSolutions(board.map((row) => [...row])) === 1) {
        toRemove--
      } else {
        board[r]![c] = backup // 恢复
      }
    }

    // 将结果写回格子
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.cells[r]![c]!.value = board[r]![c]!
        this.cells[r]![c]!.isClue = board[r]![c]! !== 0
      }
    }
  }
}

import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const useSudokuStore = defineStore('sudoku', () => {
  const board = reactive(new Board())
  const selected = ref<{ row: number; col: number } | null>(null)
  const solvable = ref(true)

  function clearStyles() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        board.cells[r]![c]!.style = CellStyle.Default
      }
    }
  }

  function highlightRelated(row: number, col: number) {
    const startR = Math.floor(row / 3) * 3
    const startC = Math.floor(col / 3) * 3
    for (let i = 0; i < 9; i++) {
      if (board.cells[row]![i]!.style !== CellStyle.Selected) {
        board.cells[row]![i]!.style = CellStyle.Related
      }
      if (board.cells[i]![col]!.style !== CellStyle.Selected) {
        board.cells[i]![col]!.style = CellStyle.Related
      }
    }
    for (let r = startR; r < startR + 3; r++) {
      for (let c = startC; c < startC + 3; c++) {
        if (board.cells[r]![c]!.style !== CellStyle.Selected) {
          board.cells[r]![c]!.style = CellStyle.Related
        }
      }
    }
  }

  function selectCell(row: number, col: number) {
    clearStyles()
    selected.value = { row, col }
    board.cells[row]![col]!.style = CellStyle.Selected
    highlightRelated(row, col)
  }

  //用户填数字，若无解则错误
  function fillNumber1(num: number) {
    if (!selected.value) return
    const { row, col } = selected.value
    const cell = board.cells[row]![col]!
    if (!cell.editable) return

    cell.value = num
    if (board.hasSolution()) {
      cell.style = CellStyle.Default
      selectCell(row, col)
    } else {
      cell.value = 0
      cell.style = CellStyle.Error
    }
  }

  //用户填数字，不符合规则 错误
  function fillNumber(num: number) {
    if (!selected.value) return
    const { row, col } = selected.value
    const cell = board.cells[row]![col]!
    if (!cell.editable) return

    if (board.ifValid(row, col, num)) {
      cell.value = num
      cell.style = CellStyle.Default
      solvable.value = board.hasSolution()
      selectCell(row, col)
    } else {
      cell.style = CellStyle.Error
    }
  }

  function erase() {
    if (!selected.value) return
    const { row, col } = selected.value
    const cell = board.cells[row]![col]!
    if (!cell.editable) return
    cell.value = 0
    cell.style = CellStyle.Default
    solvable.value = board.hasSolution()
    selectCell(row, col)
  }

  function newGame() {
    board.newGame()
    selected.value = null
    // Debug: check the board state
    const values = board.cells.map(r => r.map(c => c.value))
    const clueCount = values.flat().filter(v => v !== 0).length
    console.log('clue count:', clueCount)
    console.log('board samples:', JSON.stringify(values.slice(0, 3)))
    const s = board.hasSolution()
    console.log('hasSolution:', s)
    solvable.value = s
  }

  return { board, selected, solvable, selectCell, fillNumber, erase, newGame }
})
