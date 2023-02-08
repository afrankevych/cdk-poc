type Creature = {
    name: string;
    type: 'pokemon' | 'digimon',
};
type Pokemon = Creature & {
    type: 'pokemon';
};
type Digimon = Creature & {
    type: 'digimon';
};

type Media = {
    bucket: string,
    path: string,
};

// type ExtractMedia = (creature: Creature, bucket: string) => Promise<Media>;
type ExtractPokemonMedia = (creature: Pokemon, bucket: string) => Promise<Media>;
type ExtractDigimonMedia = (creature: Digimon, bucket: string) => Promise<Media>;
