export type Socks = { style: string; color: string };
export type Shirt = { style: string; size: string };
export type Pants = { waist: number; length: number };

export class Drawer<T> {
  private items: T[] = [];

  public get isEmpty(): boolean {
    return this.items.length === 0;
  }

  public addItem(item: T): void {
    this.items.push(item);
  }

  public removeItem(): T | undefined {
    return this.items.pop();
  }

  public removeAll(): T[] {
    const removedItems = this.items;
    this.items = [];
    return removedItems;
  }
}

export class Dresser<Top, Middle, Bottom> {
  public readonly top = new Drawer<Top>();
  public readonly middle = new Drawer<Middle>();
  public readonly bottom = new Drawer<Bottom>();
}

export function demonstrateDresser(): void {
  const dresser = new Dresser<Socks, Shirt, Pants>();

  console.log("Top drawer starts empty:", dresser.top.isEmpty);
  dresser.top.addItem({ style: "crew", color: "white" });
  dresser.top.addItem({ style: "ankle", color: "blue" });
  console.log("Top drawer is now empty:", dresser.top.isEmpty);
  console.log("Last socks added:", dresser.top.removeItem());
  console.log("Remaining socks:", dresser.top.removeAll());
  console.log("Top drawer is empty again:", dresser.top.isEmpty);
  console.log("Remove from an empty drawer:", dresser.top.removeItem());

  dresser.middle.addItem({ style: "polo", size: "M" });
  dresser.bottom.addItem({ waist: 32, length: 30 });
  console.log("Shirts:", dresser.middle.removeAll());
  console.log("Pants:", dresser.bottom.removeAll());
}
