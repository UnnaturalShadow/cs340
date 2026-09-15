import * as fs from "fs";

class Color {
  public red: number;
  public green: number;
  public blue: number;

  constructor() {
    this.red = 0;
    this.green = 0;
    this.blue = 0;
  }
}

class Image {
  private pixels: Color[][];

  constructor(width: number, height: number) {
    this.pixels = new Array<Color[]>(width);
    for (let x = 0; x < width; ++x) {
      this.pixels[x] = new Array<Color>(height);
    }
  }

  public getWidth(): number {
    return this.pixels.length;
  }

  public getHeight(): number {
    return this.pixels[0] ? this.pixels[0].length : 0;
  }

  public set(x: number, y: number, color: Color): void {
    const column = this.pixels[x];
    if (column === undefined) {
      throw new Error(`Invalid x index: ${x}`);
    }
    column[y] = color;
  }

  public get(x: number, y: number): Color {
    const column = this.pixels[x];
    if (column === undefined) {
      throw new Error(`Invalid x index: ${x}`);
    }
    const color = column[y];
    if (color === undefined) {
      throw new Error(`Invalid y index: ${y}`);
    }
    return color;
  }
}

class ImageEditor {
  public static main(args: string[]): void {
    new ImageEditor().run(args);
  }

  public constructor() {
    return;
  }

  public run(args: string[]): void {
    try {
      if (args.length < 3) {
        this.usage();
        return;
      }

      const inputFile = args[0];
      const outputFile = args[1];
      const filter = args[2];

      if (inputFile === undefined || outputFile === undefined || filter === undefined) {
        this.usage();
        return;
      }

      const image = this.read(inputFile);

      if (filter === "grayscale" || filter === "greyscale") {
        if (args.length !== 3) {
          this.usage();
          return;
        }
        this.grayscale(image);
      } else if (filter === "invert") {
        if (args.length !== 3) {
          this.usage();
          return;
        }
        this.invert(image);
      } else if (filter === "emboss") {
        if (args.length !== 3) {
          this.usage();
          return;
        }
        this.emboss(image);
      } else if (filter === "motionblur") {
        if (args.length !== 4) {
          this.usage();
          return;
        }

        const motionLengthArg = args[3];
        if (motionLengthArg === undefined) {
          this.usage();
          return;
        }

        let length = -1;
        try {
          const parsed = Number.parseInt(motionLengthArg, 10);
          length = Number.isNaN(parsed) ? -1 : parsed;
        } catch (error) {
          // Ignore
        }

        if (length < 0) {
          this.usage();
          return;
        }

        this.motionblur(image, length);
      } else {
        this.usage();
      }

      this.write(image, outputFile);
    } catch (error) {
      console.error(error);
    }
  }

  private usage(): void {
    console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}");
  }

  private motionblur(image: Image, length: number): void {
    if (length < 1) {
      return;
    }

    for (let x = 0; x < image.getWidth(); ++x) {
      for (let y = 0; y < image.getHeight(); ++y) {
        const curColor = image.get(x, y);

        const maxX = Math.min(image.getWidth() - 1, x + length - 1);
        for (let i = x + 1; i <= maxX; ++i) {
          const tmpColor = image.get(i, y);
          curColor.red += tmpColor.red;
          curColor.green += tmpColor.green;
          curColor.blue += tmpColor.blue;
        }

        const delta = maxX - x + 1;
        curColor.red = Math.floor(curColor.red / delta);
        curColor.green = Math.floor(curColor.green / delta);
        curColor.blue = Math.floor(curColor.blue / delta);
      }
    }
  }

  private invert(image: Image): void {
    for (let x = 0; x < image.getWidth(); ++x) {
      for (let y = 0; y < image.getHeight(); ++y) {
        const curColor = image.get(x, y);

        curColor.red = 255 - curColor.red;
        curColor.green = 255 - curColor.green;
        curColor.blue = 255 - curColor.blue;
      }
    }
  }

  private grayscale(image: Image): void {
    for (let x = 0; x < image.getWidth(); ++x) {
      for (let y = 0; y < image.getHeight(); ++y) {
        const curColor = image.get(x, y);

        let grayLevel = (curColor.red + curColor.green + curColor.blue) / 3;
        grayLevel = Math.max(0, Math.min(grayLevel, 255));

        curColor.red = grayLevel;
        curColor.green = grayLevel;
        curColor.blue = grayLevel;
      }
    }
  }

  private emboss(image: Image): void {
    for (let x = image.getWidth() - 1; x >= 0; --x) {
      for (let y = image.getHeight() - 1; y >= 0; --y) {
        const curColor = image.get(x, y);

        let diff = 0;
        if (x > 0 && y > 0) {
          const upLeftColor = image.get(x - 1, y - 1);
          if (Math.abs(curColor.red - upLeftColor.red) > Math.abs(diff)) {
            diff = curColor.red - upLeftColor.red;
          }
          if (Math.abs(curColor.green - upLeftColor.green) > Math.abs(diff)) {
            diff = curColor.green - upLeftColor.green;
          }
          if (Math.abs(curColor.blue - upLeftColor.blue) > Math.abs(diff)) {
            diff = curColor.blue - upLeftColor.blue;
          }
        }

        let grayLevel = 128 + diff;
        grayLevel = Math.max(0, Math.min(grayLevel, 255));

        curColor.red = grayLevel;
        curColor.green = grayLevel;
        curColor.blue = grayLevel;
      }
    }
  }

  private read(filePath: string): Image {
    const content = fs.readFileSync(filePath, "utf8");
    const tokens = content.trim().split(/\s+/);

    if (tokens.length < 4) {
      throw new Error("Invalid PPM image file");
    }

    const magic = tokens[0];
    if (magic !== "P3") {
      throw new Error(`Unsupported PPM format: ${magic}`);
    }

    const nextToken = (): string => {
      const token = tokens[index];
      if (token === undefined) {
        throw new Error("Invalid PPM image file");
      }
      index += 1;
      return token;
    };

    let index = 1;
    const width = Number.parseInt(nextToken(), 10);
    const height = Number.parseInt(nextToken(), 10);

    const image = new Image(width, height);

    Number.parseInt(nextToken(), 10);

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const color = new Color();
        color.red = Number.parseInt(nextToken(), 10);
        color.green = Number.parseInt(nextToken(), 10);
        color.blue = Number.parseInt(nextToken(), 10);
        image.set(x, y, color);
      }
    }

    return image;
  }

  private write(image: Image, filePath: string): void {
    const lines: string[] = [];
    lines.push("P3");
    lines.push(`${image.getWidth()} ${image.getHeight()}`);
    lines.push("255");

    for (let y = 0; y < image.getHeight(); ++y) {
      let row = "";
      for (let x = 0; x < image.getWidth(); ++x) {
        const color = image.get(x, y);
        row += `${x === 0 ? "" : " "}${color.red} ${color.green} ${color.blue}`;
      }
      lines.push(row);
    }

    fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
  }
}

if (require.main === module) {
  ImageEditor.main(process.argv.slice(2));
}
