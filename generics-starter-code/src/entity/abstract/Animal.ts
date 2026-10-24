export abstract class Animal {
  name: string;
  trainingPriority: number;

  constructor(name: string, trainingPriority: number) {
    this.trainingPriority = trainingPriority;
    this.name = name;
  }

  static getAnimalsSorted<T extends Animal>(animalList: T[]): T[] {
    return animalList.sort(
      (first, second) => first.trainingPriority - second.trainingPriority
    );
  }

  static getAnimalsTrainingPriorityList<T extends Animal>(animalList: T[]): string {
    return animalList
      .map(
        (animal) =>
          animal.name + "'s training priority: " + animal.trainingPriority + "\n"
      )
      .join("");
  }
}
