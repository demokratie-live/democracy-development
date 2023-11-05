/**
 * A data bundle decripes all forms of information it's their metadata.
 * <T>: Datatype of the wrapped data.
 */
export class DataPackage<D, M> {
  /**
   * Meta Data.
   */
  public meta: M | null = null;

  /**
   * Raw data.
   */
  public data: D | null = null;

  constructor(data: D | null, meta?: M | null) {
    this.setData(data);
    if (meta) {
      this.setMeta(meta);
    }
  }

  public setData(data: D | null) {
    this.data = data;
  }
  public setMeta(meta: M | null) {
    this.meta = meta;
  }

  public getData(): D | null {
    return this.data;
  }

  public getMeta(): M | null {
    return this.meta;
  }

  public free(): void {
    this.data = null;
    this.meta = null;
  }
}
