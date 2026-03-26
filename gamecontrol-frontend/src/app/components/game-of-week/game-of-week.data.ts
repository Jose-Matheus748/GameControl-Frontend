export interface Destaque {
  image: string;
  title: string;
  description: string;
  link: string;
  rating?: number; // opcional
}

export const DESTAQUES: Destaque[] = [
  {
    image: 'assets/gamesImgs/expedition-33.jpg',
    title: 'Clair Obscur: Expedition 33',
    description: 'Em um mundo de fantasia sombria e visual deslumbrante, inspirado na Belle Époque francesa, a humanidade enfrenta uma extinção iminente. Todos os anos, uma entidade misteriosa conhecida como "A Pintora" marca um número em um monólito distante, e todos com essa idade desaparecem instantaneamente no fenômeno do "Gommage" (Apagamento). Ano após ano, o número diminui, e o tempo está acabando. Você se junta aos membros da Expedição 33, a missão final e desesperada para atravessar o oceano e destruir a Pintora antes que o número chegue a zero. Com apenas um ano restante de vida para a maioria dos seus membros, esta jornada é uma corrida contra o tempo, a perda e o destino..',
    link: '#',
    rating: 5
  }
];
