/**
 * 通用对象池
 * @param T 对象类型
 */
export class ObjectPool<T> {
  private pool: T[] = [] // 空闲对象队列
  private allocated = 0 // 已分配出去的对象数量（用于控制最大数量）

  /**
   * @param factory 创建新对象的工厂函数
   * @param maxSize 池子最大容量（包括正在使用和空闲的）
   * @param initSize 初始预创建的对象数量
   * @param reset 可选的对象重置函数，在对象归还时调用
   */
  constructor(
    private factory: () => T,
    private maxSize: number,
    initSize: number = 0,
    private reset?: (obj: T) => void,
  ) {
    // 预创建初始对象
    this.grow(Math.min(initSize, maxSize))
  }

  /** 内部方法：扩充池子（创建新对象并放入空闲池） */
  private grow(count: number): void {
    for (let i = 0; i < count && this.pool.length + this.allocated < this.maxSize; i++) {
      this.pool.push(this.factory())
    }
  }

  /** 借出一个对象 */
  acquire(): T {
    // 如果空闲池为空，尝试创建新对象（但不超过最大数量）
    if (this.pool.length === 0) {
      if (this.allocated < this.maxSize) {
        this.allocated++
        return this.factory()
      } else {
        throw new Error(`对象池已达上限 (${this.maxSize})，无法创建新对象`)
      }
    }
    // 从空闲池取出一个对象
    const obj = this.pool.pop()!
    this.allocated++
    return obj
  }

  /** 归还对象 */
  release(obj: T): void {
    // 可选：调用用户提供的重置函数，清空对象状态
    if (this.reset) {
      this.reset(obj)
    }
    // 如果当前池子已满（空闲对象太多），可以选择丢弃该对象，避免内存浪费
    if (this.pool.length >= this.maxSize) {
      // 丢弃对象，让垃圾回收器回收
      this.allocated--
      return
    }
    this.pool.push(obj)
    this.allocated--
  }

  /** 获取当前池子中的总对象数（已分配 + 空闲） */
  size(): number {
    return this.allocated + this.pool.length
  }

  /** 清空池子（释放所有空闲对象） */
  clear(): void {
    this.pool.length = 0
  }
}
