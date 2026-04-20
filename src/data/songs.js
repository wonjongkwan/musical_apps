export const baseSongs = [
  {
    id: "base1",
    title: "Twinkle Twinkle Little Star",
    icon: "⭐",
    audioUrl: "/audio/twinkle.ogg", 
    lyrics: [
      { time: 0.0, text: "(Intro playing...)" },
      { time: 2.0, text: "Twinkle twinkle little star" },
      { time: 6.0, text: "How I wonder what you are" },
      { time: 10.0, text: "Up above the world so high" },
      { time: 14.0, text: "Like a diamond in the sky" }
    ]
  },
  {
    id: "base2",
    title: "The Alphabet Song",
    icon: "🔤",
    audioUrl: "/audio/rowboat.ogg", // reusing audio for simplicity
    lyrics: [
      { time: 0.0, text: "(Intro...)" },
      { time: 1.0, text: "A B C D E F G" },
      { time: 5.5, text: "H I J K L M N O P" },
      { time: 10.0, text: "Q R S T U V W X Y Z" }
    ]
  },
  {
    id: "base3",
    title: "London Bridge",
    icon: "🌉",
    audioUrl: "/audio/twinkle.ogg", // reusing audio for simplicity
    lyrics: [
      { time: 0.0, text: "(Intro...)" },
      { time: 2.0, text: "London Bridge is falling down" },
      { time: 6.0, text: "Falling down falling down" },
      { time: 10.0, text: "London Bridge is falling down" },
      { time: 14.0, text: "My fair lady" }
    ]
  },
  {
    id: "base4",
    title: "Baa Baa Black Sheep",
    icon: "🐑",
    audioUrl: "/audio/rowboat.ogg", // reusing audio
    lyrics: [
      { time: 0.0, text: "(Intro...)" },
      { time: 2.0, text: "Baa baa black sheep" },
      { time: 6.0, text: "Have you any wool" },
      { time: 10.0, text: "Yes sir yes sir" },
      { time: 14.0, text: "Three bags full" }
    ]
  },
  {
    id: "base5",
    title: "Old MacDonald",
    icon: "👨‍🌾",
    audioUrl: "/audio/twinkle.ogg", // reusing audio
    lyrics: [
      { time: 0.0, text: "(Intro...)" },
      { time: 2.0, text: "Old MacDonald had a farm" },
      { time: 6.0, text: "E I E I O" },
      { time: 10.0, text: "And on his farm he had a cow" },
      { time: 14.0, text: "E I E I O" }
    ]
  }
];

// Generate 50 levels based on the baseSongs
export const songs = [];

for (let i = 1; i <= 50; i++) {
  // Determine Stage (1 to 5)
  const stage = Math.floor((i - 1) / 10) + 1;
  // Determine base song index (cycle through 0-4)
  const baseSongIndex = (i - 1) % baseSongs.length;
  const baseSong = baseSongs[baseSongIndex];
  
  // Requirement scaling:
  // Stage 1: 30% required, Level 50: 80% required
  const requiredAccuracy = 20 + (i * 1.5); 
  
  songs.push({
    id: `level_${i}`,
    level: i,
    stage: stage,
    title: `${baseSong.title}`,
    difficulty: `Stage ${stage}`,
    icon: baseSong.icon,
    audioUrl: baseSong.audioUrl,
    lyrics: baseSong.lyrics,
    requiredAccuracy: requiredAccuracy,
    isVocal: stage <= 2
  });
}
